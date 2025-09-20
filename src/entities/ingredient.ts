import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Recipe } from "@/entities/recipe";

@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column("int")
  public position!: number;

  @Column("float")
  public amount!: number;

  @Column("text")
  public title!: string;

  @ManyToOne(() => Recipe, (recipe) => recipe.ingredients)
  public recipe!: Recipe;
}
