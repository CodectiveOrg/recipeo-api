import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

import { Recipe } from "@/entities/recipe";

@Entity()
export class Step {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column("int")
  public position!: number;

  @Column("text")
  public description!: string;

  @Column("text", { nullable: true })
  public picture!: string | null;

  @ManyToOne(() => Recipe, (recipe) => recipe.steps)
  public recipe!: Relation<Recipe>;
}
