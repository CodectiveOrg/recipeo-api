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

  @ManyToOne(() => User, (user) => user.likes)
  public user!: User;

  @ManyToOne(() => Recipe, (recipe) => recipe.likes)
  public recipe!: Recipe;

  @CreateDateColumn({ select: false })
  public createdAt!: Date;
}
