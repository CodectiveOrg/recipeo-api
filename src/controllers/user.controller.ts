import { Request, Response } from "express";

import { Like, Repository } from "typeorm";

import { z } from "zod";

import { EmailSchema } from "@/validation/schemas/email.schema";
import { PasswordSchema } from "@/validation/schemas/password.schema";
import { UsernameSchema } from "@/validation/schemas/username.schema";

import { ResponseDto } from "@/dto/response.dto";
import { GetOneUserResponseDto } from "@/dto/user-response.dto";

import { User } from "@/entities/user";

import { DatabaseService } from "@/services/database.service";
import { FileService } from "@/services/file.service";

import { fetchUserFromToken } from "@/utils/api.utils";
import { hashPassword } from "@/utils/auth.utils";
import { assignDefinedValues } from "@/utils/object.utils";

export class UserController {
  private readonly fileService: FileService;

  private readonly userRepo: Repository<User>;

  public constructor(databaseService: DatabaseService) {
    this.fileService = new FileService("user");

    this.userRepo = databaseService.dataSource.getRepository(User);

    this.getOneUser = this.getOneUser.bind(this);
    this.update = this.update.bind(this);
    this.follow = this.follow.bind(this);
    this.unfollow = this.unfollow.bind(this);
  }

  public async getOneUser(
    req: Request,
    res: Response<GetOneUserResponseDto>,
  ): Promise<void> {
    const params = GetOneUserParamsSchema.parse(req.params);

    const { entities, raw } = await this.userRepo
      .createQueryBuilder("user")
      .addSelect(
        (qb) =>
          qb
            .select("COUNT(*) > 0", "isFollowedByCurrentUser")
            .from("user_followers_user", "ufu")
            .where('ufu."userId_1" = :id', { id: params.id })
            .andWhere('ufu."userId_2" = :currentUserId', {
              currentUserId: res.locals.user?.id,
            }),
        "isFollowedByCurrentUser",
      )
      .where("user.id = :id", { id: params.id })
      .getRawAndEntities();

    if (entities.length === 0) {
      res.status(404).json({
        message: "User not found.",
        error: "Not Found",
      });

      return;
    }

    const user = {
      ...entities[0],
      isFollowedByCurrentUser: raw[0].isFollowedByCurrentUser,
    };

    res.json({
      message: "User fetched successfully.",
      result: user,
    });
  }

  public async update(req: Request, res: Response<ResponseDto>): Promise<void> {
    const body = UpdateBodySchema.parse(req.body);
    const user = await fetchUserFromToken(res, this.userRepo);

    if (body.password) {
      body.password = await hashPassword(body.password);
    } else {
      body.password = undefined;
    }

    const updatedUser = assignDefinedValues(user, body);

    if (req.file) {
      await this.fileService.remove(user.picture);
      updatedUser.picture = await this.fileService.save(req.file);
    }

    await this.userRepo.save(updatedUser);

    res.json({ message: "Profile updated successfully." });
  }

  public async follow(req: Request, res: Response<ResponseDto>): Promise<void> {
    const params = FollowParamsSchema.parse(req.params);

    const currentUser = await this.userRepo.findOne({
      where: { username: Like(res.locals.user.username) },
      relations: { following: true },
    });

    if (!currentUser) {
      res.status(404).json({
        message: "Current user not found.",
        error: "Not Found",
      });

      return;
    }

    if (currentUser.following.some((user) => user.id === params.targetUserId)) {
      res.status(400).json({
        message: "You are already following this user.",
        error: "Bad Request",
      });

      return;
    }

    const targetUser = await this.userRepo.findOne({
      where: { id: params.targetUserId },
    });

    if (!targetUser) {
      res.status(404).json({
        message: "Target user not found.",
        error: "Not Found",
      });

      return;
    }

    currentUser.following.push(targetUser);

    await this.userRepo.save(currentUser);

    res.json({ message: "Followed successfully." });
  }

  public async unfollow(
    req: Request,
    res: Response<ResponseDto>,
  ): Promise<void> {
    const params = UnfollowParamsSchema.parse(req.params);

    const currentUser = await this.userRepo.findOne({
      where: { username: Like(res.locals.user.username) },
      relations: { following: true },
    });

    if (!currentUser) {
      res.status(404).json({
        message: "Current user not found.",
        error: "Not Found",
      });

      return;
    }

    if (
      !currentUser.following.some((user) => user.id === params.targetUserId)
    ) {
      res.status(400).json({
        message: "You are not following this user.",
        error: "Bad Request",
      });

      return;
    }

    currentUser.following = currentUser.following.filter(
      (user) => user.id !== params.targetUserId,
    );

    await this.userRepo.save(currentUser);

    res.json({ message: "Unfollowed successfully." });
  }
}

const GetOneUserParamsSchema = z.object({
  id: z.coerce.number(),
});

const FollowParamsSchema = z.object({
  targetUserId: z.coerce.number(),
});

const UnfollowParamsSchema = z.object({
  targetUserId: z.coerce.number(),
});

const UpdateBodySchema = z.object({
  username: UsernameSchema.optional(),
  email: EmailSchema.optional(),
  password: PasswordSchema.optional(),
});
