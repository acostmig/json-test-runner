import { chromium, firefox, webkit, Browser, Page } from "playwright";
import { error } from "console";
import { getConfiguration, Configuration } from "./config";
import { TestAction } from "./schemas/test-action";
import { TestScenario } from "./schemas/test-scenario";
import { TestStep } from "./schemas/test-step";
import { TestRun } from "./schemas/test-run";
import { resolveLocator } from "./locator-resolver";

export async function runTests(testRun: TestRun): Promise<void> {
  const config = getConfiguration();
  
  // Select browser
  const browserType = {
    chrome: chromium,
    firefox: firefox,
    webkit: webkit,
  }[testRun.browser] || chromium; // Default to Chromium

  const browser: Browser = await browserType.launch();

  console.log(`🚀 Running tests on ${testRun.host} using ${testRun.browser}`);

  await ExecuteTestRun(config, browser, testRun);

  await browser.close();
}

async function ExecuteTestRun(config: Configuration, browser: Browser, testRun: TestRun) {
  for (const scenario of testRun.scenarios) {
    const context = await browser.newContext({baseURL: testRun.host, recordVideo: {dir:"./videos"}});
    const page: Page = await context.newPage();
    try{
      executeScenario(config, page, scenario);
    }
    finally{
      await context.close();
    }

  }
  
}

async function executeScenario(config: Configuration, page: Page, scenario: TestScenario) {
  console.log(`📌 Executing scenario: ${scenario.label?? scenario.name}`);
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

export async function executeAction(config: Configuration, page: Page, action: TestAction) {

    console.log(`    - 🔹 Performing action: ` + (action.label ?? `${action.type}`));

    if (action.type === "navigate") {
      await HandleActionTypeNavigate(action, page)
      return;
    }
    if (action.type === "sleep") {
      if(!action.value)
      {
        throw error("Action type: sleep must have 'value' prop in MS")
      }
      await page.waitForTimeout(Number.parseInt(action.value));
      return;
    }
    //handle selector based action (replaces locator property in the object)
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
