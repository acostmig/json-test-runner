import { Locator } from "playwright";
import { parseHTML} from "linkedom";
import { Configuration } from "./config-default";
import { getConfiguration } from "./config";

/**
 * Loads the user's Playwright config dynamically if it exists.
 * Falls back to default config if no user config is found.
 */

async function getRuleId(html: string, config: Configuration): Promise<string | null> {
  const { document } = parseHTML(html);
  const element = document.firstElementChild;
  if (!element) return null;
  
  for (const [id, condition] of Object.entries(config.rules)) {
    if (condition(element)) {
      return id;
    }
  }

  return null; // No match found
}

/**
 * Finds the best matching locator and sets its value.
 * @param locator Locator representing the field
 * @param value Value to be set.
 * @param waitSeconds Timeout in seconds (default: 30s).
 */
export async function setLocatorValue(locator: Locator, value: string|undefined): Promise<void> {
  const html = await locator.evaluate(el => el.outerHTML);
  const config = await getConfiguration();
  const tagName = await locator.evaluate((el) => el.tagName.toLowerCase());

  const ruleId = await getRuleId(html, config)

  if (ruleId && config.setterStrategies[ruleId]) {
    return await config.setterStrategies[tagName](locator, value);
  }
  
  throw new Error(`❌ Couldn't find a rule match for on element ${locator} \b html: ${html}`);
}

export async function getFieldValue(locator: Locator, value: string|undefined): Promise<string|null> {
  const html = await locator.evaluate(el => el.outerHTML);
  const config = await getConfiguration();
  const tagName = await locator.evaluate((el) => el.tagName.toLowerCase());

  const ruleId = await getRuleId(html, config)

  if (ruleId && config.getterStrategies[ruleId]) {
    return await config.getterStrategies[tagName](locator);
  }
  
  throw new Error(`❌ Couldn't find a rule match for on element ${locator} \b html: ${html}`);
}