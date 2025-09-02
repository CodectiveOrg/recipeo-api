import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Recipe } from "@/entities/recipe";

@Entity()
export class Step {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column("int")
  public position!: number;

  @Column("text")
  public title!: string;

  @ManyToOne(() => Recipe, (recipe) => recipe.steps)
  public recipe!: Recipe;
}
