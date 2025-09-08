import { Repository, SelectQueryBuilder } from "typeorm";

import { User } from "@/entities/user";

export function createUserQueryBuilder(
  userRepo: Repository<User>,
): SelectQueryBuilder<User> {
  return userRepo
    .createQueryBuilder("user")
    .loadRelationCountAndMap("user.recipesCount", "user.recipes")
    .loadRelationCountAndMap("user.followersCount", "user.followers")
    .loadRelationCountAndMap("user.followingCount", "user.following");
}
