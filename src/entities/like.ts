import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
<<<<<<< HEAD
=======
  Unique,
>>>>>>> main
} from "typeorm";

import { Recipe } from "@/entities/recipe";
import { User } from "@/entities/user";

@Entity()
<<<<<<< HEAD
=======
@Unique(["user", "recipe"])
>>>>>>> main
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
