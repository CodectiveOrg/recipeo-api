import { ResponseDto } from "@/dto/response.dto";

import { Featured } from "@/entities/featured";
import { Recipe } from "@/entities/recipe";

export type GetOneRecipeResponseDto = ResponseDto<Recipe>;
export type GetFeaturedResponseDto = ResponseDto<Featured[]>;
export type GetPopularResponseDto = ResponseDto<Recipe[]>;
