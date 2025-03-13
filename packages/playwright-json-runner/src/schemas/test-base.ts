import { z } from "zod";

const withLabelSchema = z.object({
  label: z.string().optional(),
});
const withDescriptionSchema = z.object({
  description: z.string().optional(),
});
export const testObjectSchema = withLabelSchema.merge(withDescriptionSchema);

