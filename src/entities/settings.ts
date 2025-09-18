import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { User } from "@/entities/user";

@Entity()
export class Settings {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column("text")
  public personalInfo!: string;

  @OneToOne(() => User, (user) => user.settings)
  public user!: User;
}
