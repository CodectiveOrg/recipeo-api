import { DeepPartial, In, Repository } from "typeorm";

import { Like } from "@/entities/like";
import { Recipe } from "@/entities/recipe";
import { User } from "@/entities/user";

import { usersData } from "@/seed/data/users.data";

import { DatabaseService } from "@/services/database.service";

export class PopularSeeder {
  private readonly likeRepo: Repository<Like>;
  private readonly recipeRepo: Repository<Recipe>;
  private readonly userRepo: Repository<User>;

  private readonly likePossibility: number = 0.2;

  public constructor(databaseService: DatabaseService) {
    this.likeRepo = databaseService.dataSource.getRepository(Like);
    this.recipeRepo = databaseService.dataSource.getRepository(Recipe);
    this.userRepo = databaseService.dataSource.getRepository(User);
  }

  public async seed(): Promise<void> {
    await this.seedPopular();
  }

  private async seedPopular(): Promise<void> {
    console.log("Start seeding popular recipes...");

    const users = await this.userRepo.find({
      where: { username: In(usersData.map((user) => user.username)) },
    });

    const recipes = await this.recipeRepo.find();

    const likes: DeepPartial<Like>[] = [];

    for (const user of users) {
      for (const recipe of recipes) {
        if (Math.random() <= this.likePossibility) {
          likes.push({ user, recipe });
        }
      }
    }

    await this.likeRepo.save(likes);

    console.log("Popular recipes seeded successfully.");
  }
}
