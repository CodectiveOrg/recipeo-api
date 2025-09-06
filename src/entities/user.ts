import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Like } from "@/entities/like";
import { Recipe } from "@/entities/recipe";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column("text")
  public username!: string;

  @Column("text", { select: false, nullable: true })
  public email!: string;

  @Column("text", { select: false })
  public password!: string;

  @Column("text", { nullable: true })
  public picture!: string | null;

  @OneToMany(() => Recipe, (recipe) => recipe.user)
  public recipes!: Recipe[];

  @OneToMany(() => Like, (like) => like.user)
  public likes!: Like[];

  @CreateDateColumn({ select: false })
  public createdAt!: Date;

  @UpdateDateColumn({ select: false })
  public updatedAt!: Date;
}
