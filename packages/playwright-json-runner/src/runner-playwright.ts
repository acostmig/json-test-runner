import { Page, Locator } from "playwright";
import { error } from "console";
import { getConfiguration } from "./config";
import { test } from '@playwright/test'
import { readFileSync } from "fs";
import { globSync } from "glob";
import { resolveLocator, TestAction, TestRun } from ".";



function loadTestFiles() {
  const config = getConfiguration();
  const jsonTestDir = config.jsonTestDir;
  const jsonTestPattern = config.jsonTestMatch;

  const finalGlobPattern = `**/${jsonTestDir}/${jsonTestPattern}`;
  console.log("Glob pattern to find test files: ", finalGlobPattern);
  const jsonFiles = globSync(finalGlobPattern);
  console.log("Found ", jsonFiles?.length, " Files.");

  return jsonFiles;
}

const jsonFiles = loadTestFiles();;

for (const testFilePath of jsonFiles) {
  const testRun: TestRun = JSON.parse(readFileSync(testFilePath, 'utf-8'));
  const config = getConfiguration();

  for (const scenario of testRun.scenarios) {
    test(scenario.label ?? scenario.name, async ({ page }) => {
      await page.goto(testRun.host);
      console.log(`📌 Executing scenario: ${scenario.label ?? scenario.name}`);

      for (const step of scenario.steps) {
        console.log(`  🛠 Step: ${step.label ?? step.description}`);

        for (const action of step.actions) {

          if (action.type === "navigate") {
            await HandleActionTypeNavigate(action, page)
            continue;
          }
          if (action.type === "sleep") {
            if(!action.value)
            {
              throw error("Action type: sleep must have 'value' prop in MS")
            }
            await page.waitForTimeout(Number.parseInt(action.value));
            continue;
          }

          console.log(`    - 🔹 Performing action: ` + (action.label ?? `${action.type}`));

          if(action.selector)
          {
            action.locator = {
              type: "selector",
              value: action.selector
            }
          }
          if (!action.locator) {
              throw new Error(`Action must have a valid locator: ${JSON.stringify(action)}`);
          }
          const locator = await resolveLocator(config.locatorStrategies, page, action.locator);

          await executeAction(locator, action);
        }
      }
    })
  }
}

async function executeAction(locator: Locator, action: TestAction) {
  const config = await getConfiguration();
  const handler = Object.entries(config.actionTypeHandlers).find(
    ([key]) => key.toLowerCase() === action.type.toLowerCase()
  )?.[1];

  if (!handler) {
    throw new Error(`No handler found for action type: ${action.type}`);
  }
  await handler(locator, action);

}

async function HandleActionTypeNavigate(action: TestAction, page: Page) {
  if (action.value) {
    console.log("navigating to: ", action.value)
    await page.goto(action.value);
  }

  else {
    throw error("navigate action requires the url to be provided as value");
  }
}
