import { testObjectSchema } from "./test-base";
import { z } from "zod";
import { testStepSchema } from "./test-step";

export const testScenarioSchema = testObjectSchema.extend({
  name: z.string(),
  steps: z.array(testStepSchema),
});
export type TestScenario = z.infer<typeof testScenarioSchema>;
