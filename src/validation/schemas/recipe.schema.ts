import { z } from "zod";

export const RecipeTitleSchema = z
  .string("Title must be a string.")
  .trim()
  .nonempty("Title cannot be empty.");

export const RecipeDescriptionSchema = z
  .string("Description must be a string.")
  .trim();

export const RecipeDurationSchema = z
  .number()
  .int("Duration must be an integer.")
  .min(1, "Duration must be greater than 1 minute.")
  .max(24 * 60, `Duration must be less than ${24 * 60} minutes.`);
