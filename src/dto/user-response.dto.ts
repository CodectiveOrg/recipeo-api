import { ResponseDto } from "@/dto/response.dto";

import { Recipe } from "@/entities/recipe";
import { User } from "@/entities/user";

export type GetOneUserResponseDto = ResponseDto<
  Pick<User, "id" | "username" | "picture"> & {
    recipesCount: number;
    followersCount: number;
    followingCount: number;
  }
>;

export type GetAllRecipesResponseDto = ResponseDto<Recipe[]>;
