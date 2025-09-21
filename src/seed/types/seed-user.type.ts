import { User } from "@/entities/user";

export type SeedUserType = Pick<
  User,
  "username" | "email" | "password" | "picture"
>;
