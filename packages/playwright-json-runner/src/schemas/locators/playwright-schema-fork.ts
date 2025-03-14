import { z } from "zod";

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

