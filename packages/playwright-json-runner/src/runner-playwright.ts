import { Page, Locator } from "playwright";
import { error } from "console";
import { smartLocator } from "./smart-locator";
import { getConfiguration } from "./config";
import { test } from '@playwright/test'
import { globSync, readFileSync } from "fs";
import { TestAction, TestRun } from ".";

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
  
  for (const scenario of testRun.scenarios) {
    test(scenario.label ?? scenario.name, async ({ page }) => {
      await page.goto(testRun.host);
      console.log(`📌 Executing scenario: ${scenario.label ?? scenario.name}`);

      for (const step of scenario.steps) {
        console.log(`  🛠 Step: ${step.label ?? step.description}`);

        for (const action of step.actions) {

          if (action.type == "navigate") {
            await HandleActionTypeNavigate(action, page)
          }

          let locator = undefined
          if (action.selector) {
            console.log(`    - 🔹 Performing action: ` + (action.label ?? `${action.type} on ${action.selector}`));
            locator = page.locator(action.selector);
          }
          else if (action.identifier) {
            console.log(`    - 🔹 Performing action: ` + (action.label ?? `${action.type} on ${action.identifier}`));
            locator = await smartLocator(page, action.identifier)
          }
          else {
            throw new Error("Action must have an 'identifier' or 'selector'")
          }
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
