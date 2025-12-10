import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(1, "Nama client harus diisi").max(100, "Nama client terlalu panjang"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;