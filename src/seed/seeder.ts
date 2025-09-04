import { Repository } from "typeorm";

import { User } from "@/entities/user";

import { DatabaseService } from "@/services/database.service";

import { hashPassword } from "@/utils/auth.utils";

import { USERS } from "./users";

export class Seeder {
  private userRepo!: Repository<User>;

  public constructor(databaseService: DatabaseService) {
    this.userRepo = databaseService.dataSource.getRepository(User);
  }

  public async seed(): Promise<void> {
    await Promise.allSettled(USERS.map(this.seedUser.bind(this)));
  }

  private async seedUser(
    user: Omit<User, "id" | "createdAt" | "updatedAt">,
  ): Promise<void> {
    const hashedPassword = await hashPassword(user.password);
    await this.userRepo.save({ ...user, password: hashedPassword });
  }
}
