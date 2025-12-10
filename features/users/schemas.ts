import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;