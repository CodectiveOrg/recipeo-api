import { ResponseDto } from "@/dto/response.dto";

import { TokenPayloadType } from "@/types/token-payload.type";

export type AuthVerifyResponseDto = ResponseDto<TokenPayloadType>;
