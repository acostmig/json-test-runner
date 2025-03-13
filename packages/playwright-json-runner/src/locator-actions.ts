import { Locator } from "playwright";
import { JSDOM } from "jsdom";
import { getConfiguration, RuleMatch, Configuration} from "./config";


/**
 * Finds the best matching locator and sets its value.
 * @param locator Locator representing the field
 * @param value Value to be set.
 * @param waitSeconds Timeout in seconds (default: 30s).
 */
export async function setLocatorValue(locator: Locator, value: string|undefined): Promise<void> {
  const html = await locator.evaluate(el => el.outerHTML);
  const config = getConfiguration();
  const ruleMatch= getRuleMatch(html, config)

  if (ruleMatch && config.setterStrategies[ruleMatch.id]) {
    const targetLocator = ruleMatch.matchedChild && ruleMatch.xpath? locator.locator(ruleMatch.xpath): locator
    return await config.setterStrategies[ruleMatch.id]({locator: targetLocator, ruleMatch, value});
  }
  
  throw new Error(`❌ Couldn't find a rule match for on element ${locator} \b html: ${html}`);
}

/**
 * Finds the best matching locator and gets its value.
 * @param locator Locator representing the field
 * @param value Value to be set.
 * @param waitSeconds Timeout in seconds (default: 30s).
 */
export async function getLocatorValue(locator: Locator): Promise<string|null> {
  const html = await locator.evaluate(el => el.outerHTML);
  const config = getConfiguration();
  const ruleMatch= getRuleMatch(html, config)
  
  if (ruleMatch && config.getterStrategies[ruleMatch.id]) {
    const targetLocator = ruleMatch.matchedChild && ruleMatch.xpath? locator.locator(ruleMatch.xpath): locator
    return await config.getterStrategies[ruleMatch.id]({locator: targetLocator, ruleMatch});
  }
  
  throw new Error(`❌ Couldn't find a rule match for on element ${locator} \b html: ${html}`);
}

function getRuleMatch(html: string, config: Configuration): RuleMatch | null {
  const { document } = new JSDOM(html).window;
  const element = document.body;  
  if (!element) return null;
  let xpathMatch = undefined;
  let matchedChild = undefined

  const xpath = (xpath: string) : boolean =>
  {
    // XPathResult.FIRST_ORDERED_NODE_TYPE = 9
      const result = document.evaluate(xpath, document, null, 9, null);
      const matchedElement = result.singleNodeValue;
      if(matchedElement) { 
        xpathMatch = xpath;
        matchedChild = element.firstElementChild !==matchedElement
        return true; 
      }
  
      return false
  }
  
  for (const [id, condition] of Object.entries(config.rules)) {
    try{
      if (condition({ document: document, element: element, xpathEval: xpath})) {
        return {id, xpath: xpathMatch, matchedChild: matchedChild??false} as RuleMatch;
      }
    }
    catch(err:any)
    {
      console.error("error executing condition: ", id)
      throw err;
    }
  }

  return null; // No match found
}
