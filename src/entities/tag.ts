import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column("text", { unique: true })
  public title!: string;
}
