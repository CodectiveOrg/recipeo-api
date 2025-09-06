import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Recipe } from "@/entities/recipe";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column("text")
  public username!: string;

  @Column("text", { nullable: true })
  public email!: string;

  @Column("text", { select: false })
  public password!: string;

  @Column("text", { nullable: true })
  public picture!: string | null;

  @OneToMany(() => Recipe, (recipe) => recipe.user)
  public recipes!: Recipe[];

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
