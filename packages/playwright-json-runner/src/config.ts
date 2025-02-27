import { cosmiconfigSync } from "cosmiconfig";
import { Locator } from "playwright";
import { ActionType, TestAction } from ".";
import actionTypeHandlers from "./defaults/action-type-handlers";
import identifierSelectors from "./defaults/identifier-selectors";
import getterSetterRules from "./defaults/getter-setter-rules";
import getterStrategies from "./defaults/getter-strategies";
import setterStrategies from "./defaults/setter-strategies";

export const baseConfig: Configuration = {
  actionTypeHandlers: actionTypeHandlers,
  identifierSelectors: identifierSelectors,
  rules: getterSetterRules,
  setterStrategies: setterStrategies,
  getterStrategies: getterStrategies,
  jsonTestDir: 'json-tests',
  jsonTestMatch: `**\/*.playwright.json`
};

export type RuleKeys =
  'input.datepicker' |
  'select' |
  'text';
export type RuleType = (params: ConditionParams) => boolean;
export type SetterStrategyType = (param: StrategyParam) => Promise<void>;
export type GetterStrategyType = (param: StrategyParam) => Promise<string | null>;
export type ActionTypeHandler = (locator: Locator, action: TestAction) => Promise<void>;
export interface RuleMatch {
  id: string
  xpath?: string,
  matchedChild: boolean
}
export interface ConditionParams {
  document: Document,
  element: Element
  xpathEval: (xpath: string) => boolean
}
export interface StrategyParam {
  locator: Locator,
  ruleMatch: RuleMatch
  value?: string
}


  /**
   * 
   * 
   * 
   * **usage**
   * 
  * playwright-json.config.ts example:
  * ```
  * import { expect } from "@playwright/test";
  * import { Configuration, baseConfig } from "playwright-json-runner/config";
  * import { getLocatorValue, setLocatorValue } from "playwright-json-runner";
  *
  * const userConfig: Configuration = {
  *   ...baseConfig,
  *   identifierSelectors: [
  *     // For example, in the application under test, all checkboxes are defined by:
  *     // having a label and a sibling right after that's an input type checkbox.
  *     // (important: the first rule to match will be used)
  *     "//label[normalize-space(text())='{input}']/following-sibling::input[@type='checkbox']"
  *     ...baseConfig.identifierSelectors,
  *   ],
  *   actionTypeHandlers: { 
  *     ...baseConfig.actionTypeHandlers,
  *     "clear": async (locator) => {
  *       setLocatorValue(locator, "");
  *     },
  *     "assertClear": async (locator) => {
  *       expect(getLocatorValue(locator)).toBe("");
  *     }
  *   },
  *   // Define when it applies (important: the first rule to match will be used)
  *   rules: {
  *     "myCustomInput": ({ xpathEval }) => xpathEval("//div[@contenteditable=true]")
  *     ...baseConfig.rules,
  *   },
  *   // Strategy for setting the value used when actionTypeHandlers call getLocatorValue
  *   setterStrategies: {
  *     ...baseConfig.setterStrategies,
  *     "myCustomInput": async ({ locator, value }) => await locator.fill(value ?? "")
  *   }
  *   // Strategy for getting the value used when actionTypeHandlers call setLocatorValue
  *   getterStrategies: {
  *     ...baseConfig.getterStrategies,
  *     "myCustomInput": async ({ locator }) => await locator.inputValue()
  *   },
  *
  * };
  *
  * export default userConfig;
  * ```
  * 
  * 
  * then the above enables you to have the following functionalities in any json test:
  *  - ```identifier: checkboxLabel``` within any action (because of ```identifierSelectors``` property)
  *  - ```clear``` action (because of ```actionTypeHandlers``` property)
  *  - ```assertClear``` action (because of ```actionTypeHandlers``` property)
  *  - ```setFieldValue``` on an input that's editable using our ```setterStrategies``` entry ```myCustomInput```
  *  - ```assertFieldValue``` on an input that's editable  ```getterStrategies``` entry ```myCustomInput```
  *  
  * ```
  * {
  *    "driver": "Playwright",
  *    "browser": "chrome",
  *    "host": "https://www.github.com/",
  *    "scenarios": [
  *        {
  *             "name": "Signup Test",
  *            "steps": [
  *                {
  *                    "description": "Navigate to create account",
  *                    "actions": [
  *                        {
  *                            "type": "clear",
  *                            "identifier": "name"
  *                        },
  *                        {
  *                            "type": "assertclear",
  *                            "identifier": "name"
  *                        },
  *                        {
  *                            "type": "click",
  *                            "identifier": "checkbox label"
  *                        },
  *                        {
  *                            "type": "setFieldValue",
  *                            "selector": "//div[@id='blog-body' and contenteditable=true]"
  *                            "value": "some blog writing"
  *                        },
  *                        {
  *                            "type": "assertFieldValueEquals",
  *                            "selector": "//div[@id='blog-body' and contenteditables=true]"
  *                            "value": "some blog writing"
  *                        } 
  *                    ]
  *                }
  *            ]
  *        }
  *     ]
  * }
  * ```
  */
interface Configuration<TActionType extends string = ActionType | string, TRuleKeys extends string = RuleKeys | string> {
    /**
   * **What**: strategies for **finding** locators using multiple XPath rules
   * 
   * **Why**: allows the system to **dynamically locate** UI elements based on various attributes 
   * and text-based identifiers, improving robustness and flexibility.
   * 
   * **When**: used when the property ```identifier``` is provided in the json under Action obect
   * return the first matching element.
   * 
   * **Requirement**: must contain XPath patterns where `{input}` will be
   *  replaced with the actual identifier from the action in the JSON.
   * 
   * **Usage**
   * 

   * 
   * **playwright-json.config.ts**:
   * ```
   * const userConfig: Configuration = {
   *    ...baseConfig,
   *    identifierSelectors:[
   *       ...baseConfig.identifierSelectors, // Keep default selectors
   *       "//label[normalize-space(text())='{input}']/following-sibling::input[@type='checkbox']"
   *    }
   * }
   * ```
   * 
   * json test example:
   * 
   * ```
   * {
   *   //... rest of the file
   *   "description": "Navigate to create account",
   *   "actions": [
   *     {
   *       "type": "click",
   *       "identifier": "checkbox label"
   *     }
   *   ]
   * }
   * ```
   * **html in the application under test**
   * ```
   * 
   * <label for="terms">Accept Terms</label>
   * <input type="checkbox" id="terms">
   * 
   * ```
   */
  identifierSelectors: string[];
  rules: Record<TRuleKeys, RuleType>;
  /**
   * **What**: strategies for **setting** the value
   * 
   * **Why** this allows the user to implement custom ways of handling setting a value
   * 
   * **When**: ```actionTypeHandlers``` call ```setLocatorValue``` and rule with the **key** returns true
   * 
   * **Requirement**: must add an entry in rules for it to apply 
   * 
   * **IMPORTANT**: rules order matters! notice how the new rule (often most complex) is defined on top, because whatever rule matches first, is the one that will be used
   * 
   * usage
   *
   * ```
   * const userConfig: Configuration = {
   *    ...baseConfig,
   *    rules: {
   *       ...baseConfig.rules, //keep default rules
   *       //defines when
   *       "myCustomInput": ({ xpathEval }) => xpathEval("//div[@contenteditable=true")
   *    },
   *    setterStrategies: {
   *        ...baseConfig.setterStrategies, //keep default strategies
   *        "myCustomInput": async ({locator, value}) => await locator.fill(value??"")
   *    }
   * }
   * ```
   */
  setterStrategies: Record<TRuleKeys, SetterStrategyType>;
  /**
   * 
   * **What**: strategies for **getting** the value
   * 
   * **Why** this allows the user to implement custom ways of handling getting a value
   * 
   * **When**: ```actionTypeHandlers``` call ```getLocatorValue``` and rule with the **key** returns true
   * 
   * **Requirement**: must add an entry in rules for it to apply 
   *  
   * **IMPORTANT**: rules order matters! notice how the new rule (often most complex) is defined on top, because whatever rule matches first, is the one that will be used
   * usage
   *
   * ```
   * const userConfig: Configuration = {
   *    ...baseConfig,
   *    rules: {
   *       //defines when
   *       "myCustomInput": ({ xpathEval }) => xpathEval("//div[@contenteditable=true")
   *       ...baseConfig.rules, //keep default rules
   *    },
   *    getterStrategies: {
   *        ...baseConfig.getterStrategies, //keep default strategies
   *        "myCustomInput": async ({locator}) => await locator.inputValue()
   *    }
   * }
   * ```
   */
  getterStrategies: Record<TRuleKeys, GetterStrategyType>;

  actionTypeHandlers: Record<TActionType, ActionTypeHandler>;
  /**
  * Directory that will be recursively scanned for test files. Defaults to the directory of the configuration file.
  */
  jsonTestDir: string;
  /**
   * Only the files matching one of these patterns are executed as test files. Matching is performed against the
   * absolute file path. Strings are treated as glob patterns.
   *
   * By default, the runner looks for files matching the following glob pattern: `**\/*.playwright.json`
   * This means Json files with `".playwright.json"` suffix, for example
   * `github.playwright.json`.
   */
  jsonTestMatch: string | RegExp;
}

export type { Configuration }



// Define the valid rule keys

let config: Configuration | undefined;

export function getConfiguration(): Configuration {
  if (config) {
    return config;
  }
  config = loadConfiguration()
  return config;
}

export function loadConfiguration(): Configuration {
  const explorer = cosmiconfigSync('playwright-json', {
    searchPlaces: [
      'playwright-json.config.ts',
      'playwright-json.config.js',
    ],
  });

  try {
    const result = explorer.search();

    if (result && result.config) {
      // console.log(`✅ Loaded user config from: ${result.filepath}`);
      const userConfig: Configuration = result.config.default || result.config;
      return userConfig;
    } else {
      // console.log('No configuration file found. Using baseConfig.');
      return baseConfig;
    }
  } catch (error) {
    console.error('❌ Failed to load user config:', error);
    return baseConfig;
  }
}
