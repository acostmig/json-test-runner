import { Locator } from "playwright";
import { JSDOM } from "jsdom";
import { getConfiguration, RuleMatch, Configuration } from "./config";

/**
 * Sets a field value using the first matching rule's setter strategy.
 */
export async function setLocatorValue(locator: Locator, value: string | undefined): Promise<void> {
  const html = await locator.evaluate((el) => el.outerHTML);
  const config = getConfiguration();
  const ruleMatch = getRuleMatch(html, config);

  if (ruleMatch && config.setterStrategies[ruleMatch.id]) {
    const targetLocator =
      ruleMatch.matchedChild && ruleMatch.xpath ? locator.locator(ruleMatch.xpath) : locator;
    return await config.setterStrategies[ruleMatch.id]({ locator: targetLocator, ruleMatch, value });
  }

  throw new Error(`No matching setter rule for element: ${html.substring(0, 200)}`);
}

/**
 * Gets a field value using the first matching rule's getter strategy.
 */
export async function getLocatorValue(locator: Locator): Promise<string | null> {
  const html = await locator.evaluate((el) => el.outerHTML);
  const config = getConfiguration();
  const ruleMatch = getRuleMatch(html, config);

  if (ruleMatch && config.getterStrategies[ruleMatch.id]) {
    const targetLocator =
      ruleMatch.matchedChild && ruleMatch.xpath ? locator.locator(ruleMatch.xpath) : locator;
    return await config.getterStrategies[ruleMatch.id]({ locator: targetLocator, ruleMatch });
  }

  throw new Error(`No matching getter rule for element: ${html.substring(0, 200)}`);
}

function getRuleMatch(html: string, config: Configuration): RuleMatch | null {
  const { document } = new JSDOM(html).window;
  const root = document.body.firstElementChild ?? document.body;
  if (!root) return null;

  let xpathMatch: string | undefined;
  let matchedChild: boolean | undefined;

  const xpathEval = (xpath: string): boolean => {
    const result = document.evaluate(xpath, root, null, 5, null);
    const firstNode = result.iterateNext();
    if (!firstNode) return false;
    const hasMultiple = !!result.iterateNext();
    xpathMatch = xpath;
    // Only narrow to child when exactly one element matched and it's not the root itself
    matchedChild = !hasMultiple && root !== firstNode;
    return true;
  };

  for (const [id, condition] of Object.entries(config.rules)) {
    try {
      xpathMatch = undefined;
      matchedChild = undefined;
      if (condition({ document, element: root, xpathEval })) {
        return { id, xpath: xpathMatch, matchedChild: matchedChild ?? false };
      }
    } catch (err) {
      console.error("Error executing rule:", id);
      throw err;
    }
  }

  return null;
}
