import { User } from "@/entities/user";

export const USERS: Omit<User, "id" | "histories">[] = [
  {
    username: "BijanProgrammer",
    email: "bijan@gmail.com",
    password: "1234",
    picture: null,
  },
  {
    username: "ZahraZare",
    email: "zahrazare@gmail.com",
    password: "1234",
    picture: null,
  },
  {
    username: "mazaherireza",
    email: "mazaherireza@gmail.com",
    password: "1234",
    picture: null,
  },
  {
    username: "Alireza",
    email: "alireza@gmail.com",
    password: "1234",
    picture: null,
  },
  {
    username: "carozamani",
    email: "carozamani@gmail.com",
    password: "1234",
    picture: null,
  },
  {
    username: "vishkayee",
    email: "vishkayee@gmail.com",
    password: "1234",
    picture: null,
  },
] as const;
