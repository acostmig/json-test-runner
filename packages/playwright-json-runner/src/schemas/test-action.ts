import { z } from "zod";
import { locatorParamsSchema } from "./locators/locator-parameters";
import { testObjectSchema } from "./test-base";

// ── Shared option shapes ────────────────────────────────────────────────────

const timeoutOpts = z.object({ timeout: z.number().optional() }).optional();

const interactOpts = z
  .object({
    timeout: z.number().optional(),
    force: z.boolean().optional(),
    trial: z.boolean().optional(),
  })
  .optional();

const waitUntilEnum = z.enum(["commit", "domcontentloaded", "load", "networkidle"]);
const loadStateEnum = z.enum(["domcontentloaded", "load", "networkidle"]);
const waitForStateEnum = z.enum(["attached", "detached", "visible", "hidden"]);

// ── Base schemas ────────────────────────────────────────────────────────────

const base = testObjectSchema; // { label?, description? }

const withLocator = base.extend({ locator: locatorParamsSchema });

// ── Page-level actions (no locator) ────────────────────────────────────────

const navigateActionSchema = base.extend({
  action: z.literal("navigate"),
  url: z.string(),
  options: z
    .object({ timeout: z.number().optional(), waitUntil: waitUntilEnum.optional() })
    .optional(),
});

const sleepActionSchema = base.extend({
  action: z.literal("sleep"),
  duration: z.number().describe("milliseconds to wait"),
});

const waitForURLActionSchema = base.extend({
  action: z.literal("waitForURL"),
  url: z.string(),
  options: z
    .object({ timeout: z.number().optional(), waitUntil: waitUntilEnum.optional() })
    .optional(),
});

const goBackActionSchema = base.extend({
  action: z.literal("goBack"),
  options: z
    .object({ timeout: z.number().optional(), waitUntil: waitUntilEnum.optional() })
    .optional(),
});

const goForwardActionSchema = base.extend({
  action: z.literal("goForward"),
  options: z
    .object({ timeout: z.number().optional(), waitUntil: waitUntilEnum.optional() })
    .optional(),
});

const waitForLoadStateActionSchema = base.extend({
  action: z.literal("waitForLoadState"),
  state: loadStateEnum.optional(),
  options: timeoutOpts,
});

const assertURLActionSchema = base.extend({
  action: z.literal("assertURL"),
  value: z.string(),
  options: timeoutOpts,
});

const assertTitleActionSchema = base.extend({
  action: z.literal("assertTitle"),
  value: z.string(),
  options: timeoutOpts,
});

const scrollActionSchema = base.extend({
  action: z.literal("scroll"),
  deltaX: z.number().describe("Horizontal scroll pixels"),
  deltaY: z.number().describe("Vertical scroll pixels"),
});

const waitForTextActionSchema = base.extend({
  action: z.literal("waitForText"),
  value: z.string(),
  options: z
    .object({
      timeout: z.number().optional(),
      state: waitForStateEnum.optional(),
    })
    .optional(),
});

const clickCoordinatesActionSchema = base.extend({
  action: z.literal("clickCoordinates"),
  x: z.number(),
  y: z.number(),
  options: z
    .object({
      button: z.enum(["left", "middle", "right"]).optional(),
      clickCount: z.number().optional(),
      delay: z.number().optional(),
    })
    .optional(),
});

// screenshot: page-level when locator is omitted
const screenshotActionSchema = base.extend({
  action: z.literal("screenshot"),
  locator: locatorParamsSchema.optional(),
  path: z.string().optional(),
  options: z
    .object({ fullPage: z.boolean().optional(), timeout: z.number().optional() })
    .optional(),
});

// assertSnapshot: uses Playwright toHaveScreenshot — locator optional (full page if absent)
const assertSnapshotActionSchema = base.extend({
  action: z.literal("assertSnapshot"),
  locator: locatorParamsSchema.optional(),
  name: z.string().optional().describe("Baseline snapshot filename"),
  options: z
    .object({
      timeout: z.number().optional(),
      maxDiffPixels: z.number().optional(),
      maxDiffPixelRatio: z.number().optional(),
      threshold: z.number().optional(),
    })
    .optional(),
});

// ── Locator actions ─────────────────────────────────────────────────────────

const clickActionSchema = withLocator.extend({
  action: z.literal("click"),
  options: z
    .object({
      button: z.enum(["left", "middle", "right"]).optional(),
      clickCount: z.number().optional(),
      delay: z.number().optional(),
      force: z.boolean().optional(),
      timeout: z.number().optional(),
      trial: z.boolean().optional(),
    })
    .optional(),
});

const dblclickActionSchema = withLocator.extend({
  action: z.literal("dblclick"),
  options: interactOpts,
});

const fillActionSchema = withLocator.extend({
  action: z.literal("fill"),
  value: z.string(),
  options: z
    .object({
      force: z.boolean().optional(),
      timeout: z.number().optional(),
      noWaitAfter: z.boolean().optional(),
    })
    .optional(),
});

const typeActionSchema = withLocator.extend({
  action: z.literal("type"),
  value: z.string(),
  options: z
    .object({ delay: z.number().optional(), timeout: z.number().optional() })
    .optional(),
});

const pressActionSchema = withLocator.extend({
  action: z.literal("press"),
  key: z.string().describe("Key or chord, e.g. 'Enter', 'Tab', 'Control+a'"),
  options: z
    .object({ delay: z.number().optional(), timeout: z.number().optional() })
    .optional(),
});

const checkActionSchema = withLocator.extend({
  action: z.literal("check"),
  options: interactOpts,
});

const uncheckActionSchema = withLocator.extend({
  action: z.literal("uncheck"),
  options: interactOpts,
});

const selectOptionActionSchema = withLocator.extend({
  action: z.literal("selectOption"),
  value: z.union([z.string(), z.array(z.string())]),
  options: z
    .object({ force: z.boolean().optional(), timeout: z.number().optional() })
    .optional(),
});

const hoverActionSchema = withLocator.extend({
  action: z.literal("hover"),
  options: interactOpts,
});

const focusActionSchema = withLocator.extend({
  action: z.literal("focus"),
  options: timeoutOpts,
});

const blurActionSchema = withLocator.extend({
  action: z.literal("blur"),
  options: timeoutOpts,
});

const clearActionSchema = withLocator.extend({
  action: z.literal("clear"),
  options: interactOpts,
});

const scrollIntoViewActionSchema = withLocator.extend({
  action: z.literal("scrollIntoView"),
  options: timeoutOpts,
});

const waitForActionSchema = withLocator.extend({
  action: z.literal("waitFor"),
  state: waitForStateEnum.optional(),
  options: timeoutOpts,
});

const waitForHiddenActionSchema = withLocator.extend({
  action: z.literal("waitForHidden"),
  options: timeoutOpts,
});

const waitForSelectorActionSchema = withLocator.extend({
  action: z.literal("waitForSelector"),
  options: timeoutOpts,
});

// ── Field value actions ─────────────────────────────────────────────────────

const setFieldValueActionSchema = withLocator.extend({
  action: z.literal("setFieldValue"),
  value: z.string(),
  options: timeoutOpts,
});

const assertFieldValueEqualsActionSchema = withLocator.extend({
  action: z.literal("assertFieldValueEquals"),
  value: z.string(),
  options: timeoutOpts,
});

const assertFieldValueContainsActionSchema = withLocator.extend({
  action: z.literal("assertFieldValueContains"),
  value: z.string(),
  options: timeoutOpts,
});

// ── Assertion actions ───────────────────────────────────────────────────────

const assertVisibleSchema = withLocator.extend({
  action: z.literal("assertVisible"),
  options: timeoutOpts,
});

const assertHiddenSchema = withLocator.extend({
  action: z.literal("assertHidden"),
  options: timeoutOpts,
});

const assertEnabledSchema = withLocator.extend({
  action: z.literal("assertEnabled"),
  options: timeoutOpts,
});

const assertDisabledSchema = withLocator.extend({
  action: z.literal("assertDisabled"),
  options: timeoutOpts,
});

const assertCheckedSchema = withLocator.extend({
  action: z.literal("assertChecked"),
  checked: z.boolean().optional().describe("Default true; set false to assert unchecked"),
  options: timeoutOpts,
});

const assertTextSchema = withLocator.extend({
  action: z.literal("assertText"),
  value: z.string(),
  options: z
    .object({ timeout: z.number().optional(), ignoreCase: z.boolean().optional() })
    .optional(),
});

const assertContainsTextSchema = withLocator.extend({
  action: z.literal("assertContainsText"),
  value: z.string(),
  options: z
    .object({ timeout: z.number().optional(), ignoreCase: z.boolean().optional() })
    .optional(),
});

const assertValueSchema = withLocator.extend({
  action: z.literal("assertValue"),
  value: z.string(),
  options: timeoutOpts,
});

const assertCountSchema = withLocator.extend({
  action: z.literal("assertCount"),
  count: z.number(),
  options: timeoutOpts,
});

const assertAttributeSchema = withLocator.extend({
  action: z.literal("assertAttribute"),
  attribute: z.string(),
  value: z.string(),
  options: timeoutOpts,
});

// ── Custom action catch-all ─────────────────────────────────────────────────

const customActionSchema = base
  .extend({
    action: z.string(),
    locator: locatorParamsSchema.optional(),
    value: z.string().optional(),
  })
  .passthrough();

// ── Union ───────────────────────────────────────────────────────────────────

const knownActionsSchema = z.discriminatedUnion("action", [
  navigateActionSchema,
  sleepActionSchema,
  goBackActionSchema,
  goForwardActionSchema,
  scrollActionSchema,
  waitForURLActionSchema,
  waitForLoadStateActionSchema,
  waitForTextActionSchema,
  clickCoordinatesActionSchema,
  assertURLActionSchema,
  assertTitleActionSchema,
  screenshotActionSchema,
  assertSnapshotActionSchema,
  clickActionSchema,
  dblclickActionSchema,
  fillActionSchema,
  typeActionSchema,
  pressActionSchema,
  checkActionSchema,
  uncheckActionSchema,
  selectOptionActionSchema,
  hoverActionSchema,
  focusActionSchema,
  blurActionSchema,
  clearActionSchema,
  scrollIntoViewActionSchema,
  waitForActionSchema,
  waitForHiddenActionSchema,
  waitForSelectorActionSchema,
  assertVisibleSchema,
  assertHiddenSchema,
  assertEnabledSchema,
  assertDisabledSchema,
  assertCheckedSchema,
  assertTextSchema,
  assertContainsTextSchema,
  assertValueSchema,
  assertCountSchema,
  assertAttributeSchema,
  setFieldValueActionSchema,
  assertFieldValueEqualsActionSchema,
  assertFieldValueContainsActionSchema,
]);

export const testActionSchema = z.union([knownActionsSchema, customActionSchema]);
export type TestAction = z.infer<typeof testActionSchema>;
