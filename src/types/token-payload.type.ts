import { User } from "@/entities/user";

export type TokenPayloadType = Pick<User, "username">;
