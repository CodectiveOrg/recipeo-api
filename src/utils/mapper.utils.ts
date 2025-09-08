import { TokenPayloadType } from "@/types/token-payload.type";

import { pick } from "@/utils/type.utils";

export function mapToTokenPayload<T extends TokenPayloadType>(
  obj: T,
): TokenPayloadType {
  return pick(obj, ["id", "username"]);
}
