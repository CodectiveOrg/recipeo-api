import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Ingredient } from "@/entities/ingredient";
import { Step } from "@/entities/step";
import { Tag } from "@/entities/tag";

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column("text")
  public title!: string;

  @Column("text")
  public description!: string;

  @Column("int")
  public duration!: number;

  @OneToMany(() => Tag, (tag) => tag.recipe, { cascade: true })
  public tags!: Tag[];

  @OneToMany(() => Ingredient, (ingredient) => ingredient.recipe, {
    cascade: true,
  })
  public ingredients!: Ingredient[];

  @OneToMany(() => Step, (step) => step.recipe, { cascade: true })
  public steps!: Step[];

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
