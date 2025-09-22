import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from "typeorm";

import { Recipe } from "@/entities/recipe";
import { User } from "@/entities/user";

@Entity()
@Unique(["user", "recipe"])
export class Like {
  @PrimaryGeneratedColumn()
  public id!: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: "CASCADE" })
  public user!: Relation<User>;

  @ManyToOne(() => Recipe, (recipe) => recipe.likes, { onDelete: "CASCADE" })
  public recipe!: Relation<Recipe>;

  @CreateDateColumn()
  public createdAt!: Date;
}
