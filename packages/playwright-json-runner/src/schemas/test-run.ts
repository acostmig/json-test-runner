import { testObjectSchema } from "./test-base";
import { z } from "zod";
import { testScenarioSchema } from "./test-scenario";

export const testRunSchema = testObjectSchema.extend({
  browser: z.enum(["chrome", "firefox", "webkit"]),
  host: z.string(),
  scenarios: z.array(testScenarioSchema),
});
export type TestRun = z.infer<typeof testRunSchema>;
