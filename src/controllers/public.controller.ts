import { Request, Response } from "express";

import { Like } from "typeorm";

import { PublicHelloResponseDto } from "@/dto/public-response.dto";

import { User } from "@/entities/user";

import { DatabaseService } from "@/services/database.service";

import { fetchUserFromToken } from "@/utils/api.utils";

export class PublicController {
  private readonly userRepo;

  public constructor(databaseService: DatabaseService) {
    this.userRepo = databaseService.dataSource.getRepository(User);

    this.helloToken = this.helloToken.bind(this);
    this.helloParams = this.helloParams.bind(this);
  }

  public async helloToken(
    _: Request,
    res: Response<PublicHelloResponseDto>,
  ): Promise<void> {
    const user = await fetchUserFromToken(res, this.userRepo);

    res.json({ message: `Hello, ${user.username}!` });
  }

  public async helloParams(
    req: Request,
    res: Response<PublicHelloResponseDto>,
  ): Promise<void> {
    const { username } = req.params;

    const user = await this.userRepo.findOne({
      where: { username: Like(username) },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found.",
        error: "Not Found",
      });

      return;
    }

    res.json({ message: `Hello, ${user.username}!` });
  }
}
