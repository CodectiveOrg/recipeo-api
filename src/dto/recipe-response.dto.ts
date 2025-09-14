import { ResponseDto } from "@/dto/response.dto";

import { Featured } from "@/entities/featured";
import { Recipe } from "@/entities/recipe";

import { Paginated } from "@/types/paginated.type";

export type CreateRecipeResponseDto = ResponseDto<{ id: number }>;
export type GetOneRecipeResponseDto = ResponseDto<Recipe>;
export type GetFeaturedResponseDto = ResponseDto<Featured[]>;
export type PaginatedRecipesResponseDto = ResponseDto<Paginated<Recipe>>;
export type SearchResponseDto = ResponseDto<Recipe[]>;
