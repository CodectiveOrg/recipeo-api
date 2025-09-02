import { Request, Response } from "express";

import { z } from "zod";

import { EmailSchema } from "@/validation/schemas/email.schema";
import { PasswordSchema } from "@/validation/schemas/password.schema";
import { UsernameSchema } from "@/validation/schemas/username.schema";

import { ResponseDto } from "@/dto/response.dto";

import { User } from "@/entities/user";

import { DatabaseService } from "@/services/database.service";
import { FileService } from "@/services/file.service";

import { fetchUserFromToken } from "@/utils/api.utils";
import { hashPassword } from "@/utils/auth.utils";
import { assignDefinedValues } from "@/utils/object.utils";

export class UserController {
  private readonly fileService: FileService;

  private readonly userRepo;

  public constructor(databaseService: DatabaseService) {
    this.fileService = new FileService("user");

    this.userRepo = databaseService.dataSource.getRepository(User);

    this.update = this.update.bind(this);
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
      updatedUser.picture = await this.fileService.save(req.file);
    }

    await this.userRepo.save(updatedUser);

    res.json({
      message: "Profile updated successfully.",
    });
  }
}

const UpdateBodySchema = z.object({
  username: UsernameSchema.optional(),
  email: EmailSchema.optional(),
  password: PasswordSchema.optional(),
});
