import { ResponseDto } from "@/dto/response.dto";

import { Tag } from "@/entities/tag";

export type GetAllTagsResponseDto = ResponseDto<Tag[]>;
