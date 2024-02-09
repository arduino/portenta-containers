import { z } from "zod";

export const ConfigureLteFormSchema = z
  .object({
    apn: z.string().min(1),
    pin: z.string().min(1).optional(),
    authentication: z.boolean(),
    username: z.string().min(1).optional(),
    password: z.string().min(1).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.authentication) {
      if (!val.username) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Username is required",
          path: ["username"],
        });
      }
      if (!val.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password is required",
          path: ["password"],
        });
      }
    }
  });

export type ConfigureLteForm = z.infer<typeof ConfigureLteFormSchema>;
