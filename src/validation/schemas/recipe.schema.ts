import { z } from "zod";

export const RecipeTitleSchema = z.string();

export const RecipeDescriptionSchema = z.string();

export const RecipeDurationSchema = z.number().min(1);

export const RecipePictureSchema = z.string().nullable();
