import { cosmiconfigSync } from "cosmiconfig";
import { Locator } from "playwright";
import actionTypeHandlers from "./defaults/action-type-handlers";
import getterSetterRules from "./defaults/getter-setter-rules";
import getterStrategies from "./defaults/getter-strategies";
import setterStrategies from "./defaults/setter-strategies";
import locatorStrategies from "./defaults/locator-strategies";
import { ActionType, TestAction } from "./schemas/test-action";
import { LocatorStrategies } from "./locator-resolver";

export const baseConfig: Configuration = {
  actionTypeHandlers: actionTypeHandlers,
  rules: getterSetterRules,
  setterStrategies: setterStrategies,
  getterStrategies: getterStrategies,
  locatorStrategies: locatorStrategies,
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
  * **usage**
  * 
  * 
  * the below config enables you to have the following functionalities in any json test:
  *  - ```locator: {type: textWaitForDom}``` within any action (because of ```locatorStrategies``` property)
  *  - ```clear``` action (because of ```actionTypeHandlers``` property)
  *  - ```assertClear``` action (because of ```actionTypeHandlers``` property)
  *  - ```setFieldValue``` on an input that's editable using our ```setterStrategies``` entry ```myCustomInput```
  *  - ```assertFieldValue``` on an input that's editable  ```getterStrategies``` entry ```myCustomInput```
  *  
  * 
  * playwright-json.config.ts example:
  * ```
  *  import { expect } from "@playwright/test";
  *  import { extendConfig } from "playwright-json-runner";
  *  import {getLocatorValue, setLocatorValue} from "playwright-json-runner"
  *
  *  const userConfig = extendConfig({
  *    jsonTestDir: "json-tests",
  *    locatorStrategies: {
  *      textWaitForDom: async (page, strategy) => 
  *      {
  *        page.waitForLoadState("domcontentloaded");
  *        return page.getByText(strategy.value)
  *      }
  *    },
  *    actionTypeHandlers:{ 
  *      "clear": async (locator)=>{
  *        setLocatorValue(locator, "")
  *      },
  *      "assertClear": async (locator)=>{
  *        expect(getLocatorValue(locator)).toBe("")
  *      }
  *    },
  *    //define when it applies
  *    rules: {
  *      "myCustomInput": ({ xpathEval }) => xpathEval("//div[@contenteditable=true")
  *    },
  *    //strategy for getting the value used when actionTypeHandlers call setLocatorValue
  *    getterStrategies: {
  *      "myCustomInput": async ({locator}) => await locator.inputValue()
  *    },
  *    //strategy for setting the value used when actionTypeHandlers call getLoctorvalue
  *    setterStrategies: {
  *      "myCustomInput": async ({locator, value}) => await locator.fill(value??"")
  *    }
  *    
  *  });
  *
  *  export default userConfig;
  * ```
  * 
  * then you can layout your playwright.json test like this:
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
  *                            "selector":"[id='name']"
  *                        },
  *                        {
  *                            "type": "assertclear",
  *                            "selector":"[id='name']"
  *                        },
  *                        {
  *                            "type": "click",
  *                            "locator":{type: "textWaitForDom": value: "Check Box Label"}
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
export function extendConfig(extensions: Partial<Configuration>): Configuration {
  return {
    ...baseConfig,
    ...extensions, // Merge top-level properties

    locatorStrategies: {
      ...baseConfig.locatorStrategies,
      ...extensions.locatorStrategies ?? {} // Merge objects
    },
    actionTypeHandlers: {
      ...baseConfig.actionTypeHandlers,
      ...extensions.actionTypeHandlers ?? {} // Merge objects
    },
    rules: {
      ...baseConfig.rules,
      ...extensions.rules ?? {} // Merge objects
    },
    getterStrategies: {
      ...baseConfig.getterStrategies,
      ...extensions.getterStrategies ?? {} // Merge objects
    },
    setterStrategies: {
      ...baseConfig.setterStrategies,
      ...extensions.setterStrategies ?? {} // Merge objects
    }
  };
}



  /**
  * **usage**
  * 
  * 
  * the below config enables you to have the following functionalities in any json test:
  *  - ```locator: {type: textWaitForDom}``` within any action (because of ```locatorStrategies``` property)
  *  - ```clear``` action (because of ```actionTypeHandlers``` property)
  *  - ```assertClear``` action (because of ```actionTypeHandlers``` property)
  *  - ```setFieldValue``` on an input that's editable using our ```setterStrategies``` entry ```myCustomInput```
  *  - ```assertFieldValue``` on an input that's editable  ```getterStrategies``` entry ```myCustomInput```
  *  
  * 
  * playwright-json.config.ts example:
  * ```
  *  import { expect } from "@playwright/test";
  *  import { extendConfig } from "playwright-json-runner";
  *  import {getLocatorValue, setLocatorValue} from "playwright-json-runner"
  *
  *  const userConfig = extendConfig({
  *    jsonTestDir: "json-tests",
  *    locatorStrategies: {
  *      textWaitForDom: async (page, strategy) => 
  *      {
  *        page.waitForLoadState("domcontentloaded");
  *        return page.getByText(strategy.value)
  *      }
  *    },
  *    actionTypeHandlers:{ 
  *      "clear": async (locator)=>{
  *        setLocatorValue(locator, "")
  *      },
  *      "assertClear": async (locator)=>{
  *        expect(getLocatorValue(locator)).toBe("")
  *      }
  *    },
  *    //define when it applies
  *    rules: {
  *      "myCustomInput": ({ xpathEval }) => xpathEval("//div[@contenteditable=true")
  *    },
  *    //strategy for getting the value used when actionTypeHandlers call setLocatorValue
  *    getterStrategies: {
  *      "myCustomInput": async ({locator}) => await locator.inputValue()
  *    },
  *    //strategy for setting the value used when actionTypeHandlers call getLoctorvalue
  *    setterStrategies: {
  *      "myCustomInput": async ({locator, value}) => await locator.fill(value??"")
  *    }
  *    
  *  });
  *
  *  export default userConfig;
  * ```
  * 
  * then you can layout your playwright.json test like this:
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
  *                            "selector":"[id='name']"
  *                        },
  *                        {
  *                            "type": "assertclear",
  *                            "selector":"[id='name']"
  *                        },
  *                        {
  *                            "type": "click",
  *                            "locator":{type: "textWaitForDom": value: "Check Box Label"}
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
  locatorStrategies: LocatorStrategies
  actionTypeHandlers: Record<TActionType, ActionTypeHandler>;
  /**
   * **What**: `xpathEval` is a function that evaluates an XPath expression within a locator's context.
   *
   * **Why**: This allows users to dynamically resolve elements **relative to a known locator**, ensuring more flexible and adaptable test strategies.
   *
   * **How It Works**:
   * - The **locator** points to an element (e.g., a `div` with `id="name"`).
   * - `xpathEval` runs an **XPath query within that element's context**.
   * - xpathEval loads the locator's HTML upfront, then runs the XPath query against it. this allows lighting fast checking of the xpath query
   *
   * ---
   *
   * **📌 Example Scenario**
   *
   * **HTML Structure:**
   * ```html
   * <body>
   *   <div id="name">
   *     <customInputTag></customInputTag>
   *   </div>
   * </body>
   * ```
   *
   * **JSON Configuration (Example Action for `setFieldValue`):**
   * ```json
   * {
   *   "selector": "[id='name']",
   *   "type": "setFieldValue",
   *   "value": "first name"
   * }
   * ```
   *
   * **📌 How `xpathEval` Works Here**
   * - The **locator** initially references the `div` (`id="name"`).
   * - `xpathEval("//customInputTag")` **runs inside the `div`'s context**, returning the `<customInputTag>` element.
   * - The `setFieldValue` action is **executed on `<customInputTag>`** instead of the `div` itself.
   *
   * ---
   *
   * **🚀 Why This Matters**
   * - Lets you **refine targeting** within an existing locator instead of writing full XPath queries.
   * - Avoids brittle full-document XPath lookups.
   * - Works well for **nested custom elements**.
   */
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
   * const userConfig = extendConfig({
   *   rules: {
   *     "contentEditableDiv": ({ xpathEval }) => xpathEval("//div[@contenteditable=true]")
   *   },
   *   setterStrategies: {
   *     "myCustomInput": async ({ locator, value }) => {
   *       await locator.fill(value ?? "");
   *     }
   *   }
   *  });
   * export default userConfig
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
   * 
   * const userConfig = extendConfig({
   *   rules: {
   *     "contentEditableDiv": ({ xpathEval }) => xpathEval("//div[@contenteditable=true]")
   *   },
   *   setterStrategies: {
   *     "contentEditableDiv": async ({locator}) => await locator.inputValue()
   *   }
   *  });
   * export default userConfig
   * 
   * ```
   */
  getterStrategies: Record<TRuleKeys, GetterStrategyType>;

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

const explorer = cosmiconfigSync('playwright-json', {
  searchPlaces: [
    'playwright-json.config.ts',
    'playwright-json.config.js',
  ],
});

export function loadConfiguration(): Configuration {
  try {
    if(explorer)
    {
      const result = explorer.search();
      if (result && result.config) {
        return result.config || result.config.default;
      } else {
        return baseConfig;
      }
    }
    else
    {
      return baseConfig;
    }
  } catch (error) {
    console.error('❌ Failed to load user config:', error);
    return baseConfig;
  }
}
