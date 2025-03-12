import { Locator, Page } from "playwright";
import { z } from "zod";

export const PlaywrightRoleSchema = z.enum([
  "alert",
  "alertdialog",
  "application",
  "article",
  "banner",
  "blockquote",
  "button",
  "caption",
  "cell",
  "checkbox",
  "code",
  "columnheader",
  "combobox",
  "complementary",
  "contentinfo",
  "definition",
  "deletion",
  "dialog",
  "directory",
  "document",
  "emphasis",
  "feed",
  "figure",
  "form",
  "generic",
  "grid",
  "gridcell",
  "group",
  "heading",
  "img",
  "insertion",
  "link",
  "list",
  "listbox",
  "listitem",
  "log",
  "main",
  "marquee",
  "math",
  "meter",
  "menu",
  "menubar",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "navigation",
  "none",
  "note",
  "option",
  "paragraph",
  "presentation",
  "progressbar",
  "radio",
  "radiogroup",
  "region",
  "row",
  "rowgroup",
  "rowheader",
  "scrollbar",
  "search",
  "searchbox",
  "separator",
  "slider",
  "spinbutton",
  "status",
  "strong",
  "subscript",
  "superscript",
  "switch",
  "tab",
  "table",
  "tablist",
  "tabpanel",
  "term",
  "textbox",
  "time",
  "timer",
  "toolbar",
  "tooltip",
  "tree",
  "treegrid",
  "treeitem",
]);

/**
 * Options for getByRole() as a Zod object, then made optional at the end.
 */
export const PlaywrightRoleOptionsSchema = z
  .object({
    checked: z.boolean().optional(),
    disabled: z.boolean().optional(),
    exact: z.boolean().optional(),
    expanded: z.boolean().optional(),
    includeHidden: z.boolean().optional(),
    level: z.number().optional(),
    // For name, accept string or RegExp. 
    // If you strictly need to parse only real RegExp objects at runtime, keep it like this.
    // If you want to accept a "string that might be a pattern," consider a string-based approach.
    name: z.union([z.string(), z.instanceof(RegExp)]).optional(),
    pressed: z.boolean().optional(),
    selected: z.boolean().optional(),
  })
  .optional();

/** Selector strategy */
export const selectorLocatorStrategySchema = z.object({
  type: z.literal("selector"),
  value: z.string(),
});
export type SelectorLocatorStrategy = z.infer<typeof selectorLocatorStrategySchema>;


/** Role strategy */
export const roleLocatorStrategySchema = z.object({
  type: z.literal("role"),
  value: z.object({
    role: PlaywrightRoleSchema,
    options: PlaywrightRoleOptionsSchema,
  }).describe("the values for role are role name and then optiosn object e.g. {value: {role: 'link', options: {name: 'sign on'}}}"),
});

export type RoleLocatorStrategy = z.infer<typeof roleLocatorStrategySchema>;


/** Test ID strategy */
export const testIdLocatorStrategySchema = z.object({
  type: z.literal("testId"),
  value: z.string(),
});
export type TestIdLocatorStrategy = z.infer<typeof testIdLocatorStrategySchema>;

/** Text strategy */
export const textLocatorStrategySchema = z.object({
  type: z.literal("text"),
  value: z.string(),
});
export type TextLocatorStrategy = z.infer<typeof textLocatorStrategySchema>;


/**
 * 1) First define the TypeScript union type manually.
 *    This represents the union of all strategies, including the "nested" type
 *    that references itself recursively.
 */
export type LocatorStrategyParams =
  | z.infer<typeof selectorLocatorStrategySchema>
  | z.infer<typeof roleLocatorStrategySchema>
  | z.infer<typeof testIdLocatorStrategySchema>
  | z.infer<typeof textLocatorStrategySchema>
  | {
      type: "nested";
      parent: LocatorStrategyParams;
      child: LocatorStrategyParams;
    };

/**
 * 2) Next, declare a mutable schema variable that we’ll assign after
 *    creating the lazy references.
 */
let locatorStrategyParamsSchema: z.ZodType<LocatorStrategyParams>;

/**
 * 3) Define the nested locator strategy schema. We use z.lazy to handle
 *    the self-referencing union.
 */
const nestedLocatorStrategySchema = z.lazy(() =>
  z.object({
    type: z.literal("nested"),
    parent: locatorStrategyParamsSchema,
    child: locatorStrategyParamsSchema,
  })
);
export type NestedLocatorStrategy = z.infer<typeof nestedLocatorStrategySchema>;


/**
 * 4) Finally, assign the union of all individual schemas plus
 *    the nested schema to `locatorStrategyParamsSchema`.
 */
locatorStrategyParamsSchema = z.union([
  selectorLocatorStrategySchema,
  roleLocatorStrategySchema,
  testIdLocatorStrategySchema,
  textLocatorStrategySchema,
  nestedLocatorStrategySchema,
]);

/**
 * Export the fully built schema and
 * the TypeScript type that is inferred from it.
 */
export { locatorStrategyParamsSchema };

export type LocatorStrategies =Partial< {
  selector: (page: Page, param: SelectorLocatorStrategy) => Promise<Locator>;
  role: (page: Page, param: RoleLocatorStrategy) => Promise<Locator>;
  testId: (page: Page, param: TestIdLocatorStrategy) => Promise<Locator>;
  text: (page: Page, param: TextLocatorStrategy) => Promise<Locator>;
  nested: (page: Page, param: NestedLocatorStrategy) => Promise<Locator>;
} & Record<string, (page: Page, param: any) => Promise<Locator>>>; 

export async function resolveLocator<T extends LocatorStrategyParams["type"]>(
    locatorStrategies: LocatorStrategies,
    page: Page, 
    strategy: Extract<LocatorStrategyParams, { type: T }>
  ): Promise<Locator> {
      // Get the correct handler
      const handler = locatorStrategies[strategy.type] as (
        page: Page, 
        param: Extract<LocatorStrategyParams, { type: T }>
      ) => Promise<Locator>;
  
      if (!handler) {
          throw new Error(`Invalid locator strategy: ${JSON.stringify(strategy)}`);
      }
  
      // Pass the correctly inferred type to the handler
      return handler(page, strategy);
}

