import { Repository } from "typeorm";

import { Featured } from "@/entities/featured";
import { Recipe } from "@/entities/recipe";

import { SeedFeaturedTypeType } from "@/seed/types/seed-featured.type";

import { DatabaseService } from "@/services/database.service";

export class FeaturedSeeder {
  private readonly featuredRepo: Repository<Featured>;
  private readonly recipeRepo: Repository<Recipe>;

  private readonly totalCount: number = 5;

  public constructor(databaseService: DatabaseService) {
    this.featuredRepo = databaseService.dataSource.getRepository(Featured);
    this.recipeRepo = databaseService.dataSource.getRepository(Recipe);
  }

  public async seed(): Promise<void> {
    await this.seedFeatured();
  }

  private async seedFeatured(): Promise<void> {
    console.log("Start seeding featured recipes...");

    const currentCount = await this.featuredRepo.count();
    const remainingCount = this.totalCount - currentCount;

    if (remainingCount <= 0) {
      console.log("Featured recipes are already set.");
      return;
    }

    const recipes = await this.recipeRepo.find({ take: remainingCount });

    if (recipes.length < remainingCount) {
      console.warn(
        `There should be at least ${remainingCount} recipes to mark as featured.`,
      );
      return;
    }

    const featured: SeedFeaturedTypeType[] = recipes.map((recipe) => ({
      picture: recipe.picture,
      recipe,
    }));

    await this.featuredRepo.save(featured);

    console.log("Featured recipes seeded successfully.");
  }
}
