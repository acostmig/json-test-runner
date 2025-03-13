import { getConfiguration } from ".";
import { test } from '@playwright/test'
import { readFileSync } from "fs";
import { globSync } from "glob";
import { TestRun } from ".";
import { executeAction } from ".";

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
          await executeAction(config, page, action);
        }
      }
    })
  }
}
