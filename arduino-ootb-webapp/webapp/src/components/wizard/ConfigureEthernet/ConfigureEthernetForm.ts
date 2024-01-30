import { z } from "zod";

export const ConfigureEthernetFormSchema = z
  .object({
    networkMode: z.enum(["auto", "static"]),
    ip: z.string().ip({ version: "v4" }).optional(),
    mask: z.string().ip({ version: "v4" }).optional(),
    gateway: z.string().ip({ version: "v4" }).optional(),
    dnsMode: z.enum(["auto", "manual"]),
    preferredDns: z.string().ip({ version: "v4" }).optional(),
    alternateDns: z.string().ip({ version: "v4" }).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.networkMode === "static") {
      if (!val.ip) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "IP address is required",
          path: ["ip"],
        });
      }
      if (!val.mask) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Subnet mask is required",
          path: ["mask"],
        });
      }
      if (!val.gateway) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Default gateway is required",
          path: ["gateway"],
        });
      }
    }
    if (val.dnsMode === "manual") {
      if (!val.preferredDns) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Preferrend DNS is required",
          path: ["preferredDns"],
        });
      }
      if (!val.alternateDns) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Alternate DNS is required",
          path: ["alternateDns"],
        });
      }
    }
  });

export type ConfigureEthernetForm = z.infer<typeof ConfigureEthernetFormSchema>;
