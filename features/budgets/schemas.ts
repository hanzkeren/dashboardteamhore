import { z } from "zod";

export const createBudgetSchema = z.object({
  clientId: z.string().uuid(),
  tanggal: z
    .union([z.string().min(1, "Tanggal wajib diisi"), z.date()])
    .transform((val) => {
      if (typeof val === "string") {
        return new Date(val);
      }
      return val;
    }),
  jenis: z.enum(["topup", "bonus", "adj"]),
  // FIX: pake coerce biar string angka dari frontend otomatis jadi number
  nominal: z.coerce.number().positive(),
  catatan: z.string().optional().or(z.literal("")),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
