import { cosmiconfigSync } from "cosmiconfig";
import path from "path";
import { Locator, Page } from "playwright";
import actionTypeHandlers from "./defaults/action-type-handlers";
import locatorStrategies from "./defaults/locator-strategies";
import { TestAction } from "./schemas/test-action";
import { LocatorStrategies } from "./locator-resolver";

export interface ActionContext {
  page: Page;
  locator?: Locator;
}

export type ActionTypeHandler = (context: ActionContext, action: TestAction) => Promise<void>;

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
}

export const baseConfig: Configuration = {
  snapshotDir: "snapshots",
  jsonTestDir: "json-tests",
  jsonTestMatch: `**/*.playwright.json`,
  locatorStrategies,
  actionTypeHandlers,
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

