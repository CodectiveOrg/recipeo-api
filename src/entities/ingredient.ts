import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from "typeorm";

import { Recipe } from "@/entities/recipe";

@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column("int")
  public position!: number;

  @Column("text")
  public title!: string;

  @ManyToOne(() => Recipe, (recipe) => recipe.ingredients)
  public recipe!: Relation<Recipe>;
}
