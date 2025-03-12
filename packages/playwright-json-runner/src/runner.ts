import { chromium, firefox, webkit, Browser, Page, Locator } from "playwright";
import { error } from "console";
import { getConfiguration } from "./config";
import {resolveLocator, TestAction, TestRun } from '.'

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

  for (const scenario of testRun.scenarios) {
    const context = await browser.newContext({baseURL: testRun.host, recordVideo: {dir:"./videos"}});
    const page: Page = await context.newPage();
    try{
      await page.goto("/");
      console.log(`📌 Executing scenario: ${scenario.label?? scenario.name}`);

      for (const step of scenario.steps) {
        console.log(`  🛠 Step: ${step.label??step.description}`);

        for (const action of step.actions) {

          if(action.type == "navigate")
          {
            await HandleActionTypeNavigate(action, page)
          }

          if (!action.locator) {
              throw new Error(`Action must have a valid locator: ${JSON.stringify(action)}`);
          }
          const locator = await resolveLocator(config.locatorStrategies, page, action.locator);
          await executeAction(locator, action);
        }
      }
    }
    finally{
      await context.close();
    }

  }

  await browser.close();
}



async function executeAction(locator:Locator, action: TestAction) {
  const config = getConfiguration();
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
