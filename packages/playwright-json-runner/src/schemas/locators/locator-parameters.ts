import { z } from "zod";
import { PlaywrightRoleOptionsSchema, PlaywrightRoleSchema } from "./playwright-schema-fork";


/** Selector strategy */
export const selectorStrategyParamsSchema = z.object({
  type: z.literal("selector"),
  value: z.string(),
});
export type SelectorStrategyParams = z.infer<typeof selectorStrategyParamsSchema>;


/** Role strategy */
export const roleStrategyParamsSchema = z.object({
  type: z.literal("role"),
  value: z.object({
    role: PlaywrightRoleSchema,
    options: PlaywrightRoleOptionsSchema,
  }).describe("the values for role are role name and then optiosn object e.g. {value: {role: 'link', options: {name: 'sign on'}}}"),
});

export type RoleStrategyParams = z.infer<typeof roleStrategyParamsSchema>;


/** Test ID strategy */
export const testIdStrategyParamsSchema = z.object({
  type: z.literal("testId"),
  value: z.string(),
});
export type TestIdStrategyParams = z.infer<typeof testIdStrategyParamsSchema>;

/** Text strategy */
export const textStrategyParamsSchema = z.object({
  type: z.literal("text"),
  value: z.string(),
});
export type TextStrategyParams = z.infer<typeof textStrategyParamsSchema>;


/**
 * 1) First define the TypeScript union type manually.
 *    This represents the union of all strategies, including the "nested" type
 *    that references itself recursively.
 */
export type LocatorStrategyParams =
  | z.infer<typeof selectorStrategyParamsSchema>
  | z.infer<typeof roleStrategyParamsSchema>
  | z.infer<typeof testIdStrategyParamsSchema>
  | z.infer<typeof textStrategyParamsSchema>
  | {
      type: "nested";
      parent: LocatorStrategyParams;
      child: LocatorStrategyParams;
    };

/**
 * 2) Next, declare a mutable schema variable that we’ll assign after
 *    creating the lazy references.
 */
let locatorParamsSchema: z.ZodType<LocatorStrategyParams>;

/**
 * 3) Define the nested locator strategy schema. We use z.lazy to handle
 *    the self-referencing union.
 */
export const nestedStrategyParamsSchema = z.lazy(() =>
  z.object({
    type: z.literal("nested"),
    parent: locatorParamsSchema,
    child: locatorParamsSchema,
  })
);
export type NestedStrategyParams = z.infer<typeof nestedStrategyParamsSchema>;


/**
 * 4) Finally, assign the union of all individual schemas plus
 *    the nested schema to `locatorParamsSchema`.
 */
locatorParamsSchema = z.union([
  selectorStrategyParamsSchema,
  roleStrategyParamsSchema,
  testIdStrategyParamsSchema,
  textStrategyParamsSchema,
  nestedStrategyParamsSchema,
]);

/**
 * Export the fully built schema and
 * the TypeScript type that is inferred from it.
 */
export { locatorParamsSchema };