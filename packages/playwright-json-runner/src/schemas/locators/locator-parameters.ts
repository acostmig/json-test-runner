import { z } from "zod";
import { PlaywrightRoleOptionsSchema, PlaywrightRoleSchema } from "./playwright-schema-fork";

// ── Concrete locator schemas ────────────────────────────────────────────────

export const selectorLocatorSchema = z.object({
  by: z.literal("selector"),
  value: z.string().describe("CSS selector"),
});

export const xpathLocatorSchema = z.object({
  by: z.literal("xpath"),
  value: z.string().describe("XPath expression"),
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
});

export const textLocatorSchema = z.object({
  by: z.literal("text"),
  value: z.string(),
  exact: z.boolean().optional(),
});

export const labelLocatorSchema = z.object({
  by: z.literal("label"),
  value: z.string(),
  exact: z.boolean().optional(),
});

export const placeholderLocatorSchema = z.object({
  by: z.literal("placeholder"),
  value: z.string(),
  exact: z.boolean().optional(),
});

export const altTextLocatorSchema = z.object({
  by: z.literal("altText"),
  value: z.string(),
  exact: z.boolean().optional(),
});

export const titleLocatorSchema = z.object({
  by: z.literal("title"),
  value: z.string(),
  exact: z.boolean().optional(),
});

export const testIdLocatorSchema = z.object({
  by: z.literal("testId"),
  value: z.string(),
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
  | { by: "nested"; parent: LocatorParams; child: LocatorParams }
  | { by: string; value?: string }; // custom strategies

let locatorParamsSchema: z.ZodType<LocatorParams>;

export const nestedLocatorSchema = z.lazy(() =>
  z.object({
    by: z.literal("nested"),
    parent: locatorParamsSchema,
    child: locatorParamsSchema,
  })
);
export type NestedLocatorParams = z.infer<typeof nestedLocatorSchema>;

const customLocatorSchema = z.object({
  by: z.string(),
  value: z.string().optional(),
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
