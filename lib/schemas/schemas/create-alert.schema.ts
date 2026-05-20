import { z } from "zod"

export const createAlertSchema = z.object({
  assetId: z.string().min(1, "Select an asset"),
  condition: z.enum(["PRICE_ABOVE", "PRICE_BELOW"], {
    required_error: "Select a condition",
  }),
  targetPrice: z.coerce
    .number({ invalid_type_error: "Enter a valid price" })
    .positive("Target price must be greater than zero"),
})

export type CreateAlertFormValues = z.infer<typeof createAlertSchema>
