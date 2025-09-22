import { SeedUserType } from "@/seed/types/seed-user.type";

export const usersData: SeedUserType[] = [
  {
    username: "BijanProgrammer",
    email: "bijaneisapour@gmail.com",
    password: "1234",
    picture: "BijanProgrammer.jpg",
  },
  {
    username: "ZahraZare",
    email: "zahrazare3099@gmail.com",
    password: "1234",
    picture: null,
  },
  {
    username: "RezaMazaheri",
    email: "rezamazaheri.email@gmail.com",
    password: "1234",
    picture: null,
  },
  {
    username: "AlirezaEghtedar",
    email: "alireza.ce2001@gmail.com",
    password: "1234",
    picture: null,
  },
] as const;
