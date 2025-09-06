import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Featured } from "@/entities/featured";
import { Ingredient } from "@/entities/ingredient";
import { Step } from "@/entities/step";
import { Tag } from "@/entities/tag";
import { User } from "@/entities/user";

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

  @Column("text", { nullable: true })
  public picture!: string | null;

  @OneToMany(() => Tag, (tag) => tag.recipe, { cascade: true })
  public tags!: Tag[];

  @OneToMany(() => Ingredient, (ingredient) => ingredient.recipe, {
    cascade: true,
  })
  public ingredients!: Ingredient[];

  @OneToMany(() => Step, (step) => step.recipe, { cascade: true })
  public steps!: Step[];

  @ManyToOne(() => User, (user) => user.recipes)
  public user!: User;

  @OneToOne(() => Featured, (featured) => featured.recipe, { cascade: true })
  public featured!: Featured;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
