import { expect } from "@playwright/test";
import { ActionContext, ActionTypeHandler } from "../config";
import { TestAction } from "../schemas/test-action";

function requireLocator(context: ActionContext, actionName: string) {
  if (!context.locator) {
    throw new Error(`Action "${actionName}" requires a locator.`);
  }
  return context.locator;
}

const actionTypeHandlers: Record<string, ActionTypeHandler> = {
  // ── Page-level ────────────────────────────────────────────────────────────

  navigate: async ({ page }, action: TestAction) => {
    const a = action as any;
    await page.goto(a.url, a.options);
  },

  sleep: async ({ page }, action: TestAction) => {
    const a = action as any;
    await page.waitForTimeout(a.duration ?? 0);
  },

  waitForURL: async ({ page }, action: TestAction) => {
    const a = action as any;
    await page.waitForURL(a.url, a.options);
  },

  waitForLoadState: async ({ page }, action: TestAction) => {
    const a = action as any;
    await page.waitForLoadState(a.state, a.options);
  },

  assertURL: async ({ page }, action: TestAction) => {
    const a = action as any;
    await expect(page).toHaveURL(a.value, a.options);
  },

  assertTitle: async ({ page }, action: TestAction) => {
    const a = action as any;
    await expect(page).toHaveTitle(a.value, a.options);
  },

  screenshot: async (context, action: TestAction) => {
    const a = action as any;
    if (context.locator) {
      await context.locator.screenshot({ path: a.path, ...a.options });
    } else {
      await context.page.screenshot({ path: a.path, ...a.options });
    }
  },

  assertSnapshot: async (context, action: TestAction) => {
    const a = action as any;
    const nameArg = a.name ? [a.name] : [];
    if (context.locator) {
      await expect(context.locator).toHaveScreenshot(...nameArg, a.options);
    } else {
      await expect(context.page).toHaveScreenshot(...nameArg, a.options);
    }
  },

  // ── Locator interactions ──────────────────────────────────────────────────

  click: async (context, action: TestAction) => {
    const locator = requireLocator(context, "click");
    await locator.click((action as any).options);
  },

  dblclick: async (context, action: TestAction) => {
    const locator = requireLocator(context, "dblclick");
    await locator.dblclick((action as any).options);
  },

  fill: async (context, action: TestAction) => {
    const locator = requireLocator(context, "fill");
    const a = action as any;
    await locator.fill(a.value, a.options);
  },

  type: async (context, action: TestAction) => {
    const locator = requireLocator(context, "type");
    const a = action as any;
    await locator.pressSequentially(a.value, a.options);
  },

  press: async (context, action: TestAction) => {
    const locator = requireLocator(context, "press");
    const a = action as any;
    await locator.press(a.key, a.options);
  },

  check: async (context, action: TestAction) => {
    const locator = requireLocator(context, "check");
    await locator.check((action as any).options);
  },

  uncheck: async (context, action: TestAction) => {
    const locator = requireLocator(context, "uncheck");
    await locator.uncheck((action as any).options);
  },

  selectOption: async (context, action: TestAction) => {
    const locator = requireLocator(context, "selectOption");
    const a = action as any;
    await locator.selectOption(a.value, a.options);
  },

  hover: async (context, action: TestAction) => {
    const locator = requireLocator(context, "hover");
    await locator.hover((action as any).options);
  },

  focus: async (context, action: TestAction) => {
    const locator = requireLocator(context, "focus");
    await locator.focus((action as any).options);
  },

  blur: async (context, action: TestAction) => {
    const locator = requireLocator(context, "blur");
    await locator.blur((action as any).options);
  },

  clear: async (context, action: TestAction) => {
    const locator = requireLocator(context, "clear");
    await locator.clear((action as any).options);
  },

  scrollIntoView: async (context, action: TestAction) => {
    const locator = requireLocator(context, "scrollIntoView");
    await locator.scrollIntoViewIfNeeded((action as any).options);
  },

  waitFor: async (context, action: TestAction) => {
    const locator = requireLocator(context, "waitFor");
    const a = action as any;
    await locator.waitFor({ state: a.state, ...a.options });
  },

  // ── Assertions ────────────────────────────────────────────────────────────

  assertVisible: async (context, action: TestAction) => {
    const locator = requireLocator(context, "assertVisible");
    await expect(locator).toBeVisible((action as any).options);
  },

  assertHidden: async (context, action: TestAction) => {
    const locator = requireLocator(context, "assertHidden");
    await expect(locator).toBeHidden((action as any).options);
  },

  assertEnabled: async (context, action: TestAction) => {
    const locator = requireLocator(context, "assertEnabled");
    await expect(locator).toBeEnabled((action as any).options);
  },

  assertDisabled: async (context, action: TestAction) => {
    const locator = requireLocator(context, "assertDisabled");
    await expect(locator).toBeDisabled((action as any).options);
  },

  assertChecked: async (context, action: TestAction) => {
    const locator = requireLocator(context, "assertChecked");
    const a = action as any;
    await expect(locator).toBeChecked({ checked: a.checked, ...a.options });
  },

  assertText: async (context, action: TestAction) => {
    const locator = requireLocator(context, "assertText");
    const a = action as any;
    await expect(locator).toHaveText(a.value, a.options);
  },

  assertContainsText: async (context, action: TestAction) => {
    const locator = requireLocator(context, "assertContainsText");
    const a = action as any;
    await expect(locator).toContainText(a.value, a.options);
  },

  assertValue: async (context, action: TestAction) => {
    const locator = requireLocator(context, "assertValue");
    const a = action as any;
    await expect(locator).toHaveValue(a.value, a.options);
  },

  assertCount: async (context, action: TestAction) => {
    const locator = requireLocator(context, "assertCount");
    const a = action as any;
    await expect(locator).toHaveCount(a.count, a.options);
  },

  assertAttribute: async (context, action: TestAction) => {
    const locator = requireLocator(context, "assertAttribute");
    const a = action as any;
    await expect(locator).toHaveAttribute(a.attribute, a.value, a.options);
  },
};

export default actionTypeHandlers;
