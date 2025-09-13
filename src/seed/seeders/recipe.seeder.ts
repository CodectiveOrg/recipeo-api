import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { In, Repository } from "typeorm";

import { Recipe } from "@/entities/recipe";
import { Tag } from "@/entities/tag";
import { User } from "@/entities/user";

import { usersData } from "@/seed/data/users.data";
import { SeedRecipeType } from "@/seed/types/seed-recipe.type";
import { SpoonacularRecipeType } from "@/seed/types/spoonacular-recipe.type";

import { DatabaseService } from "@/services/database.service";

import { formatFilenamePrefix } from "@/utils/format.utils";

const BASE_URL = "https://api.spoonacular.com/recipes/random";

export class RecipeSeeder {
  private readonly recipeRepo: Repository<Recipe>;
  private readonly tagRepo: Repository<Tag>;
  private readonly userRepo: Repository<User>;

  private readonly batchSize: number;

  private titleToTagMap: Map<string, Tag> = new Map();

  public constructor(databaseService: DatabaseService) {
    this.recipeRepo = databaseService.dataSource.getRepository(Recipe);
    this.tagRepo = databaseService.dataSource.getRepository(Tag);
    this.userRepo = databaseService.dataSource.getRepository(User);

    const envBatchSize = Number.parseInt(process.env.RECIPE_SEEDER_BATCH_SIZE!);
    this.batchSize = !isNaN(envBatchSize) ? envBatchSize : 10;
  }

  private get folderPath(): string {
    return path.join(process.env.FILE_STORAGE_PATH!, "recipe");
  }

  private get apiUrl(): string {
    const params = new URLSearchParams({
      apiKey: process.env.SPOONACULAR_API_KEY!,
      number: this.batchSize.toString(),
    });

    return `${BASE_URL}?${params}`;
  }

  public async seed(): Promise<void> {
    await fs.mkdir(this.folderPath, { recursive: true });
    await this.seedRecipes();
  }

  private async seedRecipes(): Promise<void> {
    console.log("Start seeding recipes...");

    if (this.batchSize <= 0) {
      console.log("Batch size doesn't allow more seeding.");
      return;
    }

    const users = await this.userRepo.find({
      where: { username: In(usersData.map((user) => user.username)) },
    });

    if (users.length === 0) {
      console.warn("No seeded user found.");
      return;
    }

    const recipesWithoutUser = await this.fetchRandomRecipes();
    if (!recipesWithoutUser) {
      return;
    }

    const recipes = recipesWithoutUser.map((recipe) => ({
      ...recipe,
      user: users[Math.floor(Math.random() * users.length)],
    }));

    await this.recipeRepo.save(recipes);
    console.log("Recipes seeded successfully.");
  }

  private async fetchRandomRecipes(): Promise<SeedRecipeType[] | null> {
    console.log("Fetching random recipes...");

    const response = await fetch(this.apiUrl);

    if (!response.ok) {
      console.warn("Fetch failed.");
      console.warn(response.statusText);
      return null;
    }

    console.log("Fetched successfully.");
    console.log("");

    const data = (await response.json()) as {
      recipes: SpoonacularRecipeType[];
    };

    await this.fetchTags(data.recipes);
    return await this.convertAllToRecipes(data.recipes);
  }

  private async fetchTags(
    spoonacularRecipes: SpoonacularRecipeType[],
  ): Promise<void> {
    const titles = new Set(
      spoonacularRecipes.flatMap((recipe) => recipe.dishTypes),
    );

    await this.tagRepo
      .createQueryBuilder()
      .insert()
      .into(Tag)
      .values([...titles].map((title) => ({ title })))
      .orIgnore()
      .execute();

    const tags = await this.tagRepo.find();
    this.titleToTagMap = new Map(tags.map((tag) => [tag.title, tag]));
  }

  private async convertAllToRecipes(
    spoonacularRecipes: SpoonacularRecipeType[],
  ): Promise<SeedRecipeType[]> {
    const recipes: SeedRecipeType[] = [];

    for (const recipe of spoonacularRecipes) {
      try {
        console.log(`Conversion of ${recipe.id} started...`);

        const mapped = await this.convertToRecipe(recipe);
        recipes.push(mapped);

        console.log(`Conversion of ${recipe.id} finished successfully.`);
      } catch (e) {
        console.warn(`Conversion of ${recipe.id} failed.`);

        if (e instanceof Error || typeof e === "string") {
          console.warn(e);
        }
      } finally {
        console.log("");
      }
    }

    return recipes;
  }

  private async convertToRecipe(
    recipe: SpoonacularRecipeType,
  ): Promise<SeedRecipeType> {
    const steps = recipe.analyzedInstructions?.[0]?.steps;
    if (!steps) {
      throw new Error("Steps not found.");
    }

    const picture = await this.downloadPicture(recipe.image, recipe.imageType);

    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.summary.split(".")[0],
      duration: recipe.readyInMinutes,
      picture,
      tags: recipe.dishTypes
        .map((title) => this.titleToTagMap.get(title))
        .filter((tag) => !!tag),
      ingredients: recipe.extendedIngredients.map((x, i) => ({
        position: i + 1,
        title: x.name,
        amount: x.amount,
        unit: x.unit,
      })),
      steps: steps.map((x) => ({
        position: x.number,
        description: x.step,
      })),
    };
  }

  private async downloadPicture(
    url: string,
    extension: string,
  ): Promise<string> {
    console.log(`Downloading picture...`);

    const response = await fetch(url);

    const filename =
      formatFilenamePrefix(new Date()) + "-" + crypto.randomUUID();
    const filenameWithExtension = filename + "." + extension;

    const filePath = path.join(this.folderPath, filenameWithExtension);
    const buffer = Buffer.from(await response.arrayBuffer());

    await fs.writeFile(filePath, buffer);

    console.log("Picture saved successfully.");

    return filenameWithExtension;
  }
}
