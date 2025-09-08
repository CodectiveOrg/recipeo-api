import { Request, Response } from "express";

import { Repository } from "typeorm";

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
  }

  public async getOneUser(
    req: Request,
    res: Response<GetOneUserResponseDto>,
  ): Promise<void> {
    const params = GetOneRecipeParamsSchema.parse(req.params);

    const user = await this.userRepo
      .createQueryBuilder("user")
      .leftJoin("user.recipes", "recipe")
      .select([
        "user.id AS id",
        "user.username AS username",
        "user.picture AS picture",
        "CAST(COUNT(recipe.id) AS INT) AS recipesCount",
      ])
      .where("user.id = :id", { id: params.id })
      .groupBy("user.id")
      .getRawOne();

    if (!user) {
      res.status(404).json({
        message: "User not found.",
        error: "Not Found",
      });

      return;
    }

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

    res.json({
      message: "Profile updated successfully.",
    });
  }
}

const GetOneRecipeParamsSchema = z.object({
  id: z.coerce.number(),
});

const UpdateBodySchema = z.object({
  username: UsernameSchema.optional(),
  email: EmailSchema.optional(),
  password: PasswordSchema.optional(),
});
