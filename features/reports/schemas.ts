import { z } from "zod";

export const createAdReportSchema = z.object({
  clientId: z.string().uuid(),
  tanggal: z.union([
    z.string().min(1, "Tanggal wajib diisi"),
    z.date(),
  ]).transform((val) => {
    // Jika string, convert ke Date
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
  idAccount: z.string().min(1, "ID Account wajib"),
  spend: z.number().nonnegative(),
  clicks: z.number().int().nonnegative().optional(),
  impressions: z.number().int().nonnegative().optional(),
  conversions: z.number().int().nonnegative().optional(),
});

export type CreateAdReportInput = z.infer<typeof createAdReportSchema>;