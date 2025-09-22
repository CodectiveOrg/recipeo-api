import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
  VirtualColumn,
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
  public recipes!: Relation<Recipe>[];

  @OneToMany(() => Like, (like) => like.user)
  public likes!: Relation<Like>[];

  @ManyToMany(() => User, (user) => user.following)
  @JoinTable()
  public followers!: Relation<User>[];

  @ManyToMany(() => User, (user) => user.followers)
  public following!: Relation<User>[];

  @CreateDateColumn({ select: false })
  public createdAt!: Date;

  @UpdateDateColumn({ select: false })
  public updatedAt!: Date;

  @VirtualColumn("int", {
    query: (alias) =>
      `SELECT COUNT(*) FROM recipe WHERE recipe."userId" = ${alias}.id`,
  })
  public recipesCount: number = 0;

  @VirtualColumn("int", {
    query: (alias) =>
      `SELECT COUNT(*) FROM user_followers_user ufu WHERE ufu."userId_1" = ${alias}.id`,
  })
  public followersCount: number = 0;

  @VirtualColumn("int", {
    query: (alias) =>
      `SELECT COUNT(*) FROM user_followers_user ufu WHERE ufu."userId_2" = ${alias}.id`,
  })
  public followingCount: number = 0;
}
