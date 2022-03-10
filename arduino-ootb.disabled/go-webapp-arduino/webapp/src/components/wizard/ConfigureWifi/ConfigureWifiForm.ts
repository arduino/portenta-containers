import { z } from "zod";

export const ConfigureWifiFormSchema = z
  .object({
    network: z.object({
      ssid: z.string().min(0).max(32),
      signal: z.number().optional(),
      security: z.string().optional(),
    }),
    password: z.string().max(64).optional(),
  })
  .superRefine((val, ctx) => {
    if (
      val.network.security !== undefined &&
      val.network.security !== "" &&
      (!val.password || val.password.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required",
        path: ["password"],
      });
    }
  });

export type ConfigureWifiForm = z.infer<typeof ConfigureWifiFormSchema>;
