import "dotenv/config";

import { ChosenSeeder } from "@/seed/seeders/chosen.seeder";
import { FeaturedSeeder } from "@/seed/seeders/featured.seeder";
import { FollowSeeder } from "@/seed/seeders/follow.seeder";
import { PopularSeeder } from "@/seed/seeders/popular.seeder";
import { RecipeSeeder } from "@/seed/seeders/recipe.seeder";
import { UserSeeder } from "@/seed/seeders/user.seeder";

import { DatabaseService } from "@/services/database.service";

import { validateEnv } from "@/utils/env.utils";

async function main(): Promise<void> {
  validateEnv();

  const databaseService = new DatabaseService();
  const isDatabaseInitialized = await databaseService.init();

  if (!isDatabaseInitialized) {
    return;
  }

  await new UserSeeder(databaseService).seed();
  console.log("");
  await new RecipeSeeder(databaseService).seed();
  console.log("");
  await new FeaturedSeeder(databaseService).seed();
  console.log("");
  await new ChosenSeeder(databaseService).seed();
  console.log("");
  await new PopularSeeder(databaseService).seed();
  console.log("");
  await new FollowSeeder(databaseService).seed();
  console.log("");

  await databaseService.dataSource.destroy();
}

main().then();
