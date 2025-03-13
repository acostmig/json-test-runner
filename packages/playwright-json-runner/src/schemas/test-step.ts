import { testActionSchema } from "./test-action";
import { testObjectSchema } from "./test-base";
import { z } from "zod";

export const testStepSchema = testObjectSchema.extend({
  description: z.string(),
  actions: z.array(testActionSchema),
});
export type TestStep = z.infer<typeof testStepSchema>;
