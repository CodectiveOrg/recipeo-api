import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
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

  @Column("text", { select: false, nullable: true })
  public email!: string;

  @Column("text", { select: false })
  public password!: string;

  @Column("text", { nullable: true })
  public picture!: string | null;

  @OneToMany(() => Recipe, (recipe) => recipe.user)
  public recipes!: Recipe[];

  @ManyToMany(() => User, (user) => user.following)
  @JoinTable()
  public followers!: User[];

  @ManyToMany(() => User, (user) => user.followers)
  public following!: User[];

  @CreateDateColumn({ select: false })
  public createdAt!: Date;

  @UpdateDateColumn({ select: false })
  public updatedAt!: Date;
}
