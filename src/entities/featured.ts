import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";

import { Recipe } from "@/entities/recipe";

@Entity()
export class Featured {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column("text", { nullable: true })
  public picture!: string | null;

  @OneToOne(() => Recipe)
  @JoinColumn()
  public recipe!: Relation<Recipe>;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;
}
