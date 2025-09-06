import { Featured } from "@/entities/featured";

export type SeedFeaturedTypeType = Omit<
  Featured,
  "id" | "createdAt" | "updatedAt"
>;
