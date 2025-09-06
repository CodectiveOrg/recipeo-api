import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Recipe } from "@/entities/recipe";

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column("text")
  public title!: string;

  @ManyToOne(() => Recipe, (recipe) => recipe.tags)
  public recipe!: Recipe;
}
