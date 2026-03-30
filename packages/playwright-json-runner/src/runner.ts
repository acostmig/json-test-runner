import { chromium, firefox, webkit, Browser, Page } from "playwright";
import { getConfiguration, Configuration } from "./config";
import { TestAction } from "./schemas/test-action";
import { TestScenario } from "./schemas/test-scenario";
import { TestStep } from "./schemas/test-step";
import { TestRun } from "./schemas/test-run";
import { resolveLocator } from "./locator-resolver";

export async function runTests(testRun: TestRun): Promise<void> {
  const config = getConfiguration();

  const browserType =
    { chrome: chromium, firefox, webkit }[testRun.browser] ?? chromium;

  const browser: Browser = await browserType.launch();

  console.log(`🚀 Running tests on ${testRun.host} using ${testRun.browser}`);

  await executeTestRun(config, browser, testRun);

  await browser.close();
}

async function executeTestRun(config: Configuration, browser: Browser, testRun: TestRun) {
  for (const scenario of testRun.scenarios) {
    const context = await browser.newContext({
      baseURL: testRun.host,
      recordVideo: { dir: "./videos" },
    });
    const page: Page = await context.newPage();
    try {
      await executeScenario(config, page, scenario);
    } finally {
      await context.close();
    }
  }
}

async function executeScenario(config: Configuration, page: Page, scenario: TestScenario) {
  console.log(`📌 Executing scenario: ${scenario.label ?? scenario.name}`);
  await page.goto("/");
  for (const step of scenario.steps) {
    await executeStep(config, page, step);
  }
}

async function executeStep(config: Configuration, page: Page, step: TestStep) {
  console.log(`  🛠 Step: ${step.label ?? step.description}`);
  for (const action of step.actions) {
    await executeAction(config, page, action);
  }
}

export async function executeAction(
  config: Configuration,
  page: Page,
  action: TestAction
): Promise<void> {
  const a = action as any;
  console.log(`    - 🔹 Performing action: ${a.label ?? a.action}`);

  const handler = config.actionTypeHandlers[a.action];
  if (!handler) {
    throw new Error(`No handler found for action type: "${a.action}". Register it in your config's actionTypeHandlers.`);
  }

  // Resolve locator only when the action carries one
  const locator =
    a.locator != null
      ? await resolveLocator(config.locatorStrategies, page, a.locator)
      : undefined;

  await handler({ page, locator }, action);
}
