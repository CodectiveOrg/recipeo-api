import { ResponseDto } from "@/dto/response.dto";

import { Featured } from "@/entities/featured";
import { Recipe } from "@/entities/recipe";

export type GetOneRecipeResponseDto = ResponseDto<Recipe>;
export type GetFeaturedResponseDto = ResponseDto<Featured[]>;
export type GetPopularResponseDto = ResponseDto<Recipe[]>;
export type GetRecentResponseDto = ResponseDto<Recipe[]>;
export type RecipeCreateRecipeResponseDto = ResponseDto<
  Omit<Recipe, "id" | "likes" | "user" | "createdAt" | "updatedAt">
>;
