import { ResponseDto } from "@/dto/response.dto";

import { TokenPayloadType } from "@/types/token-payload.type";

export type AuthSignUpResponseDto = ResponseDto;

export type AuthSignInResponseDto = ResponseDto;

export type AuthSignOutResponseDto = ResponseDto;

export type AuthVerifyResponseDto = ResponseDto<TokenPayloadType>;
