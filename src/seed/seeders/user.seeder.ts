import { Repository } from "typeorm";

import { User } from "@/entities/user";

import { usersData } from "@/seed/data/users.data";
import { SeedUserType } from "@/seed/types/seed-user.type";

import { DatabaseService } from "@/services/database.service";

import { hashPassword } from "@/utils/auth.utils";

export class UserSeeder {
  private readonly userRepo: Repository<User>;

  public constructor(databaseService: DatabaseService) {
    this.userRepo = databaseService.dataSource.getRepository(User);
  }

  public async seed(): Promise<void> {
    await Promise.allSettled(usersData.map(this.seedUser.bind(this)));
  }

  private async seedUser(user: SeedUserType): Promise<void> {
    const foundUser = await this.userRepo.findOne({
      where: { username: user.username },
    });

    if (foundUser) {
      console.log(`User already exists. Username: ${user.username}`);
      return;
    }

    const hashedPassword = await hashPassword(user.password);
    await this.userRepo.save({ ...user, password: hashedPassword });

    console.log(`User saved successfully. Username: ${user.username}`);
  }
}
