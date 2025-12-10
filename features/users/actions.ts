"use server";

import { prisma } from "@/lib/db";
import { createUserSchema, type CreateUserInput } from "./schemas";
import bcrypt from "bcryptjs";

export async function createUser(input: CreateUserInput) {
  const data = createUserSchema.parse(input);

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: hashedPassword,
      role: data.role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

export async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { data: users };
}

export async function deleteUser(userId: string) {
  await prisma.user.delete({
    where: {
      id: userId,
    },
  });
}