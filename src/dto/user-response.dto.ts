import { ResponseDto } from "@/dto/response.dto";

import { User } from "@/entities/user";

export type GetOneUserResponseDto = ResponseDto<
  Pick<User, "id" | "username" | "picture"> & {
    recipesCount: number;
  }
>;
