import { getConfiguration } from ".";
import { test } from '@playwright/test'
import { readFileSync } from "fs";
import { globSync } from "glob";
import { TestRun } from ".";
import { executeAction } from ".";
import path from "path";

function loadTestFiles() {
  const config = getConfiguration();

  const finalGlobPattern = `**/${config.jsonTestDir}/${config.jsonTestMatch}`;
  console.log("Glob pattern to find test files: ", finalGlobPattern);
  const jsonFiles = globSync(finalGlobPattern, { cwd: config.configDir!, absolute: true });
  console.log("Found ", jsonFiles?.length, " Files.");

  return { jsonFiles, config };
}

function resolveSnapshotDir(config: ReturnType<typeof getConfiguration>): string {
  const dir = config.snapshotDir;
  if (path.isAbsolute(dir)) return dir;
  return path.join(config.configDir ?? process.cwd(), dir);
}

const { jsonFiles, config } = loadTestFiles();

for (const testFilePath of jsonFiles) {

  const testRun: TestRun = JSON.parse(readFileSync(testFilePath, 'utf-8'));

  for (const scenario of testRun.scenarios) {
    test(scenario.label ?? scenario.name, async ({ page }, testInfo) => {
      const userSetSnapshotDir = testInfo.project.snapshotDir !== testInfo.project.testDir;
      if (!userSetSnapshotDir) {
        (testInfo.project as any).snapshotDir = resolveSnapshotDir(config);
        (testInfo as any)._projectInternal.snapshotPathTemplate =
          '{snapshotDir}/{arg}{-projectName}{-snapshotSuffix}{ext}';
      }
      let idx = 0;
      await page.goto(testRun.host);
      console.log(`📌 Executing scenario: ${scenario.label ?? scenario.name}`);

      for (const step of scenario.steps) {
        console.log(`  🛠 Step: ${step.label ?? step.description}`);
        await test.step(step.label ?? step.description, async () => {
          for (const action of step.actions) {
            try {
              await page.evaluate((id) => console.log(`JSONIDX:${id}:START`), idx);
              await executeAction(config, page, action);
              await page.evaluate((id) => console.log(`JSONIDX:${id}:END`), idx);
            } finally {
              idx++;
            }
          }
        });
      }
    })
  }
}
