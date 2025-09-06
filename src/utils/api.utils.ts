import { Response } from "express";

import { Like, Repository } from "typeorm";

import { User } from "@/entities/user";

export async function fetchUserFromToken(
  res: Response,
  userRepo: Repository<User>,
  includeAllColumns: boolean = false,
): Promise<User> {
  const { username } = res.locals.user;

  const user = includeAllColumns
    ? await selectUserWithAllColumns(userRepo, username)
    : await userRepo.findOne({ where: { username: Like(username) } });

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
}

export async function selectUserWithAllColumns(
  userRepo: Repository<User>,
  username: string,
): Promise<User | null> {
  const columns = userRepo.metadata.columns.map(
    (column) => `user.${column.propertyName}`,
  );

  return userRepo
    .createQueryBuilder("user")
    .select(columns)
    .where({ username: Like(username) })
    .getOne();
}
