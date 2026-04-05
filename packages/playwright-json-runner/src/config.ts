import { cosmiconfigSync } from "cosmiconfig";
import path from "path";
import { Locator, Page } from "playwright";
import actionTypeHandlers from "./defaults/action-type-handlers";
import getterSetterRules from "./defaults/getter-setter-rules";
import getterStrategies from "./defaults/getter-strategies";
import setterStrategies from "./defaults/setter-strategies";
import locatorStrategies from "./defaults/locator-strategies";
import { TestAction } from "./schemas/test-action";
import { LocatorStrategies } from "./locator-resolver";

export interface ActionContext {
  page: Page;
  locator?: Locator;
}

export type ActionTypeHandler = (context: ActionContext, action: TestAction) => Promise<void>;

export interface ConditionParams {
  document: Document;
  element: Element;
  xpathEval: (xpath: string) => boolean;
}

export interface RuleMatch {
  id: string;
  xpath?: string;
  matchedChild: boolean;
}

export interface StrategyParam {
  locator: Locator;
  ruleMatch: RuleMatch;
  value?: string;
}

export type RuleType = (params: ConditionParams) => boolean;
export type SetterStrategyType = (param: StrategyParam) => Promise<void>;
export type GetterStrategyType = (param: StrategyParam) => Promise<string | null>;

export interface Configuration<TActionType extends string = string> {
  /**
   * Absolute path to the directory containing the playwright-json config file.
   * Resolved automatically — do not set manually.
   * @internal
   */
  configDir?: string;
  /**
   * Directory where visual-regression snapshots are stored.
   * Defaults to `snapshots` (resolved relative to `configDir`).
   */
  snapshotDir: string;
  /**
   * Directory that will be recursively scanned for test files.
   * Defaults to `json-tests`.
   */
  jsonTestDir: string;
  /**
   * Glob pattern or RegExp to match test files.
   * Defaults to `**\/*.playwright.json`.
   */
  jsonTestMatch: string | RegExp;
  /**
   * Locator strategy functions keyed by the `by` discriminant value.
   * Add custom entries here to support new `by` types in your JSON tests.
   *
   * @example
   * ```ts
   * locatorStrategies: {
   *   textAfterLoad: async (page, params) => {
   *     await page.waitForLoadState("domcontentloaded");
   *     return page.getByText(params.value);
   *   }
   * }
   * // Then in JSON: { "by": "textAfterLoad", "value": "Submit" }
   * ```
   */
  locatorStrategies: LocatorStrategies;
  /**
   * Action handler functions keyed by the `action` field value.
   * Add custom entries here to support new action types in your JSON tests.
   *
   * @example
   * ```ts
   * actionTypeHandlers: {
   *   clearAndFill: async ({ locator }, action) => {
   *     if (!locator) throw new Error("clearAndFill requires a locator");
   *     await locator.clear();
   *     await locator.fill((action as any).value ?? "");
   *   }
   * }
   * // Then in JSON: { "action": "clearAndFill", "locator": {...}, "value": "hello" }
   * ```
   */
  actionTypeHandlers: Record<TActionType, ActionTypeHandler>;
  /**
   * Rules that determine which getter/setter strategy applies to a given element.
   * Each rule receives the element's HTML and returns true if its strategy should be used.
   * Order matters — the first matching rule wins.
   *
   * `xpathEval` runs an XPath query within the element's context, allowing you to
   * match on child elements (e.g. a `<select>` or `<input>` inside a wrapper `<div>`).
   */
  rules: Record<string, RuleType>;
  /**
   * Strategies for **setting** a field value. Keyed by rule name.
   * Called by `setLocatorValue` when the matching rule fires.
   */
  setterStrategies: Record<string, SetterStrategyType>;
  /**
   * Strategies for **getting** a field value. Keyed by rule name.
   * Called by `getLocatorValue` when the matching rule fires.
   */
  getterStrategies: Record<string, GetterStrategyType>;
}

export const baseConfig: Configuration = {
  snapshotDir: "snapshots",
  jsonTestDir: "json-tests",
  jsonTestMatch: `**/*.playwright.json`,
  locatorStrategies,
  actionTypeHandlers,
  rules: getterSetterRules,
  setterStrategies,
  getterStrategies,
};

/**
 * Merge your custom config on top of the defaults.
 *
 * @example
 * ```ts
 * // playwright-json.config.ts
 * import { extendConfig } from "playwright-json-runner";
 *
 * export default extendConfig({
 *   jsonTestDir: "e2e/json-tests",
 *   actionTypeHandlers: {
 *     myCustomAction: async ({ locator }, action) => {
 *       await locator!.fill((action as any).value ?? "");
 *     }
 *   }
 * });
 * ```
 */
export function extendConfig<TActionType extends string = string>(
  extensions: Partial<Configuration<TActionType>>
): Configuration<TActionType> {
  return {
    ...(baseConfig as Configuration<TActionType>),
    ...extensions,
    locatorStrategies: {
      ...baseConfig.locatorStrategies,
      ...(extensions.locatorStrategies ?? {}),
    },
    actionTypeHandlers: {
      ...(baseConfig.actionTypeHandlers as Record<TActionType, ActionTypeHandler>),
      ...(extensions.actionTypeHandlers ?? {}),
    },
    rules: {
      ...baseConfig.rules,
      ...(extensions.rules ?? {}),
    },
    setterStrategies: {
      ...baseConfig.setterStrategies,
      ...(extensions.setterStrategies ?? {}),
    },
    getterStrategies: {
      ...baseConfig.getterStrategies,
      ...(extensions.getterStrategies ?? {}),
    },
  };
}

let config: Configuration | undefined;

export function getConfiguration(): Configuration {
  if (config) return config;
  config = loadConfiguration();
  return config;
}

const explorer = cosmiconfigSync("playwright-json", {
  searchPlaces: ["playwright-json.config.ts", "playwright-json.config.js"],
});

export function loadConfiguration(): Configuration {
  try {
    if (explorer) {
      const result = explorer.search();
      if (result && result.config) {
        const userConfig: Configuration = result.config.default ?? result.config;
        userConfig.configDir = path.dirname(result.filepath);
        return userConfig;
      }
    }
    return baseConfig;
  } catch (error) {
    console.error("❌ Failed to load user config:", error);
    return baseConfig;
  }
}

