import { DataSource } from "typeorm";

import { Ingredient } from "@/entities/ingredient";
import { Recipe } from "@/entities/recipe";
import { Step } from "@/entities/step";
import { Tag } from "@/entities/tag";
import { User } from "@/entities/user";

export class DatabaseService {
  public dataSource: DataSource;

  public constructor() {
    this.dataSource = new DataSource({
      type: "postgres",
      url: process.env.DATABASE_URL!,
      entities: [Ingredient, Recipe, Step, Tag, User],
      synchronize: true,
      logging: false,
    });
  }

  public async init(): Promise<boolean> {
    return await this.isConnected();
  }

  private async isConnected(): Promise<boolean> {
    try {
      await this.dataSource.initialize();
      console.log("Connection has been established successfully.");
      return true;
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      return false;
    }
  }
}
