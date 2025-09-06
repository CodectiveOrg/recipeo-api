import { User } from "@/entities/user";

export type SeedUserType = Omit<
  User,
  "id" | "recipes" | "createdAt" | "updatedAt"
>;
