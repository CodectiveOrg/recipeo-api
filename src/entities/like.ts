import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Recipe } from "@/entities/recipe";
import { User } from "@/entities/user";

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  public id!: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: "CASCADE" })
  public user!: User;

  @ManyToOne(() => Recipe, (recipe) => recipe.likes, { onDelete: "CASCADE" })
  public recipe!: Recipe;

  @CreateDateColumn()
  public createdAt!: Date;
}
