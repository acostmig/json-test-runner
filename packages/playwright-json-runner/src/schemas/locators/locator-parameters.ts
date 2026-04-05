import { z } from "zod";
import { PlaywrightRoleOptionsSchema, PlaywrightRoleSchema } from "./playwright-schema-fork";

// ── Concrete locator schemas ────────────────────────────────────────────────

const nthField = { nth: z.number().optional() };

export const selectorLocatorSchema = z.object({
  by: z.literal("selector"),
  value: z.string().describe("CSS selector"),
  ...nthField,
});

export const xpathLocatorSchema = z.object({
  by: z.literal("xpath"),
  value: z.string().describe("XPath expression"),
  ...nthField,
});

export const roleLocatorSchema = z.object({
  by: z.literal("role"),
  role: PlaywrightRoleSchema,
  name: z.union([z.string(), z.instanceof(RegExp)]).optional(),
  exact: z.boolean().optional(),
  checked: z.boolean().optional(),
  disabled: z.boolean().optional(),
  expanded: z.boolean().optional(),
  includeHidden: z.boolean().optional(),
  level: z.number().optional(),
  pressed: z.boolean().optional(),
  selected: z.boolean().optional(),
  ...nthField,
});

export const textLocatorSchema = z.object({
  by: z.literal("text"),
  value: z.string(),
  exact: z.boolean().optional(),
  ...nthField,
});

export const labelLocatorSchema = z.object({
  by: z.literal("label"),
  value: z.string(),
  exact: z.boolean().optional(),
  ...nthField,
});

export const placeholderLocatorSchema = z.object({
  by: z.literal("placeholder"),
  value: z.string(),
  exact: z.boolean().optional(),
  ...nthField,
});

export const altTextLocatorSchema = z.object({
  by: z.literal("altText"),
  value: z.string(),
  exact: z.boolean().optional(),
  ...nthField,
});

export const titleLocatorSchema = z.object({
  by: z.literal("title"),
  value: z.string(),
  exact: z.boolean().optional(),
  ...nthField,
});

export const testIdLocatorSchema = z.object({
  by: z.literal("testId"),
  value: z.string(),
  ...nthField,
});

// ── Recursive nested locator ────────────────────────────────────────────────

export type LocatorParams =
  | z.infer<typeof selectorLocatorSchema>
  | z.infer<typeof xpathLocatorSchema>
  | z.infer<typeof roleLocatorSchema>
  | z.infer<typeof textLocatorSchema>
  | z.infer<typeof labelLocatorSchema>
  | z.infer<typeof placeholderLocatorSchema>
  | z.infer<typeof altTextLocatorSchema>
  | z.infer<typeof titleLocatorSchema>
  | z.infer<typeof testIdLocatorSchema>
  | { by: "nested"; parent: LocatorParams; child: LocatorParams; nth?: number }
  | { by: string; value?: string; nth?: number }; // custom strategies

let locatorParamsSchema: z.ZodType<LocatorParams>;

export const nestedLocatorSchema = z.lazy(() =>
  z.object({
    by: z.literal("nested"),
    parent: locatorParamsSchema,
    child: locatorParamsSchema,
    ...nthField,
  })
);
export type NestedLocatorParams = z.infer<typeof nestedLocatorSchema>;

const customLocatorSchema = z.object({
  by: z.string(),
  value: z.string().optional(),
  ...nthField,
});

locatorParamsSchema = z.union([
  z.discriminatedUnion("by", [
    selectorLocatorSchema,
    xpathLocatorSchema,
    roleLocatorSchema,
    textLocatorSchema,
    labelLocatorSchema,
    placeholderLocatorSchema,
    altTextLocatorSchema,
    titleLocatorSchema,
    testIdLocatorSchema,
  ]),
  nestedLocatorSchema,
  customLocatorSchema,
]);

export { locatorParamsSchema };

// Legacy role options export kept for backward compat with playwright-schema-fork consumers
export { PlaywrightRoleOptionsSchema, PlaywrightRoleSchema };
