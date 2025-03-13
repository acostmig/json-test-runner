import { locatorParamsSchema } from "./locators/locator-parameters";
import { testObjectSchema } from "./test-base";
import { z } from "zod";

export const actionTypeSchema = z.enum([
  "setfieldvalue",
  "click",
  "navigate",
  "expect",
  "assertFieldValueEquals",
  "assertFieldValueContains",
  "assertElementExists",
  "sleep"
]).describe("The type of action to perform");

export type ActionType = z.infer<typeof actionTypeSchema>;

export const testActionSchema = testObjectSchema.extend({
  type: actionTypeSchema,
  value: z.string().optional(),
  playwrightFunction: z.string().optional().describe("on verify steps, the expect function to use (e.g. toBe is the playwright equivalent to: expect(locator).toBe(value)"),
  locator: locatorParamsSchema.optional().describe("Locator to use for the action"),
  selector: z.string().optional().describe("Selector to use for the action (replaces locator)"),
});
export type TestAction = z.infer<typeof testActionSchema>;
