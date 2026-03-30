import { extendConfig, ActionContext } from "playwright-json-runner";

const userConfig = extendConfig({
  jsonTestDir: "json-tests",

  /**
   * Custom locator strategy example.
   * Use { "by": "visibleText", "value": "Submit" } in your JSON tests.
   */
  locatorStrategies: {
    visibleText: async (page, params) => {
      const p = params as { value: string };
      return page.getByText(p.value, { exact: false }).filter({ hasText: p.value });
    },
  },

  /**
   * Custom action handler example.
   * Use { "action": "clearAndFill", "locator": {...}, "value": "hello" } in your JSON tests.
   */
  actionTypeHandlers: {
    clearAndFill: async ({ locator }: ActionContext, action) => {
      if (!locator) throw new Error("clearAndFill requires a locator");
      await locator.clear();
      await locator.fill((action as any).value ?? "");
    },
  },
});

export default userConfig;
