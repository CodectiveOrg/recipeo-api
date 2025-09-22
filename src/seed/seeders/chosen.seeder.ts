import { Repository } from "typeorm";

import { Recipe } from "@/entities/recipe";

import { DatabaseService } from "@/services/database.service";

export class ChosenSeeder {
  private readonly recipeRepo: Repository<Recipe>;

  private readonly totalCount: number = 15;

  public constructor(databaseService: DatabaseService) {
    this.recipeRepo = databaseService.dataSource.getRepository(Recipe);
  }

  public async seed(): Promise<void> {
    await this.seedChosen();
  }

  private async seedChosen(): Promise<void> {
    console.log("Start seeding chosen recipes...");

    const currentCount = await this.recipeRepo.count({
      where: { isChosen: true },
    });
    const remainingCount = this.totalCount - currentCount;

    if (remainingCount <= 0) {
      console.log("Chosen recipes are already set.");
      return;
    }

    const recipes = await this.recipeRepo.find({
      where: { isChosen: false },
      take: remainingCount,
    });

    if (recipes.length < remainingCount) {
      console.warn(
        `There should be at least ${remainingCount} recipes to mark as chosen.`,
      );
      return;
    }

    const chosen = recipes.slice(0, remainingCount);
    chosen.forEach((recipe) => {
      recipe.isChosen = true;
    });

    await this.recipeRepo.save(chosen);

    console.log("Chosen recipes seeded successfully.");
  }
}
