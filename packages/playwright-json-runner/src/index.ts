import zodToJsonSchema from "zod-to-json-schema";
import { locatorStrategyParamsSchema } from "./locator-resolver";
import { z } from "zod";

const withLabelSchema = z.object({
  label: z.string().optional(),
});
const withDescriptionSchema = z.object({
  description: z.string().optional(),
});
const testObjectSchema = withLabelSchema.merge(withDescriptionSchema);

const actionTypeSchema = z.enum([
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

const testActionSchema = testObjectSchema.extend({
  type: actionTypeSchema,
  value: z.string().optional(),
  playwrightFunction: z.string().optional().describe("on verify steps, the expect function to use (e.g. toBe is the playwright equivalent to: expect(locator).toBe(value)"),
  locator: locatorStrategyParamsSchema.optional().describe("Locator to use for the action"),
  selector: z.string().optional().describe("Selector to use for the action (replaces locator)"),
});
export type TestAction = z.infer<typeof testActionSchema>;


const testStepSchema = testObjectSchema.extend({
  description: z.string(),
  actions: z.array(testActionSchema),
});
export type TestStep = z.infer<typeof testStepSchema>;

//
// 6. TestScenario extends TestObject, with required `name` and array of steps
//
const testScenarioSchema = testObjectSchema.extend({
  name: z.string(),
  steps: z.array(testStepSchema),
});
export type TestScenario = z.infer<typeof testScenarioSchema>;

const testRunSchema = testObjectSchema.extend({
  browser: z.enum(["chrome", "firefox", "webkit"]),
  host: z.string(),
  scenarios: z.array(testScenarioSchema),
});
export type TestRun = z.infer<typeof testRunSchema>;

export { getLocatorValue, setLocatorValue } from "./locator-actions";
export { runTests } from './runner'
export * from "./locator-resolver";

export function dumpSchema()
{
  const jsonSchema = zodToJsonSchema(testRunSchema, {
      name: "TestRun",
    });
  console.log(JSON.stringify(jsonSchema, null, 2));
}