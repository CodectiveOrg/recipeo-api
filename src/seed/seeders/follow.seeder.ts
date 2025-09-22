import { In, Repository } from "typeorm";

import { User } from "@/entities/user";

import { usersData } from "@/seed/data/users.data";

import { DatabaseService } from "@/services/database.service";

export class FollowSeeder {
  private readonly userRepo: Repository<User>;

  private readonly followPossibility: number = 0.2;

  public constructor(databaseService: DatabaseService) {
    this.userRepo = databaseService.dataSource.getRepository(User);
  }

  public async seed(): Promise<void> {
    await this.seedFollow();
  }

  private async seedFollow(): Promise<void> {
    console.log("Start seeding follow...");

    const users = await this.userRepo.find({
      where: { username: In(usersData.map((user) => user.username)) },
      relations: { following: true },
    });

    for (const currentUser of users) {
      for (const targetUser of users) {
        if (currentUser.id === targetUser.id) {
          continue;
        }

        if (Math.random() <= this.followPossibility) {
          currentUser.following.push(targetUser);
        }
      }
    }

    await this.userRepo.save(users);

    console.log("Follow seeded successfully.");
  }
}
