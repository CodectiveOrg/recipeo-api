import { Request, Response } from "express";

import { Like, Repository } from "typeorm";

import { z } from "zod";

import { PasswordSchema } from "@/validation/schemas/password.schema";
import { UsernameSchema } from "@/validation/schemas/username.schema";

import { AuthVerifyResponseDto } from "@/dto/auth-response.dto";
import { ResponseDto } from "@/dto/response.dto";

import { User } from "@/entities/user";

import { DatabaseService } from "@/services/database.service";

import { selectUserWithAllColumns } from "@/utils/api.utils";
import {
  comparePasswords,
  generateToken,
  hashPassword,
} from "@/utils/auth.utils";
import { mapToTokenPayload } from "@/utils/mapper.utils";

export class AuthController {
  private readonly userRepo: Repository<User>;

  public constructor(databaseService: DatabaseService) {
    this.userRepo = databaseService.dataSource.getRepository(User);

    this.signUp = this.signUp.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.verify = this.verify.bind(this);
  }

  public async signUp(req: Request, res: Response<ResponseDto>): Promise<void> {
    const body = SignUpBodySchema.parse(req.body);
    const { username, password } = body;

    const user = await this.userRepo.findOne({
      where: [{ username: Like(username) }],
    });

    if (user) {
      res.status(409).json({
        message: "Username is already taken.",
        error: "Conflict",
      });

      return;
    }

    const hashedPassword = await hashPassword(password);
    const savedUser = await this.userRepo.save({
      ...body,
      password: hashedPassword,
    });

    generateToken(res, mapToTokenPayload(savedUser));

    res.status(201).json({ message: "Signed up successfully." });
  }

  public async signIn(req: Request, res: Response<ResponseDto>): Promise<void> {
    const body = SignInBodySchema.parse(req.body);
    const { username, password } = body;

    // NOTE: Since some columns aren't selected by default,
    //       the easiest way to select all columns is to use this method.
    const user = await selectUserWithAllColumns(this.userRepo, username);

    if (!user) {
      res.status(401).json({
        message: "Username or password is incorrect.",
        error: "Unauthorized",
      });

      return;
    }

    const isPasswordCorrect = await comparePasswords(password, user.password);

    if (!isPasswordCorrect) {
      res.status(401).json({
        message: "Username or password is incorrect.",
        error: "Unauthorized",
      });

      return;
    }

    generateToken(res, mapToTokenPayload(user));

    res.status(200).json({ message: "Signed in successfully." });
  }

  public async signOut(_: Request, res: Response<ResponseDto>): Promise<void> {
    res.clearCookie(process.env.TOKEN_KEY!);

    res.status(200).json({ message: "Signed out successfully." });
  }

  public async verify(
    _: Request,
    res: Response<AuthVerifyResponseDto>,
  ): Promise<void> {
    const { user } = res.locals;

    if (!user) {
      res.sendStatus(401);
      return;
    }

    res.status(200).json({ message: "Token is valid.", result: user });
  }
}

const SignUpBodySchema = z.object({
  username: UsernameSchema,
  password: PasswordSchema,
});

const SignInBodySchema = z.object({
  username: z.string().nonempty(),
  password: z.string().nonempty(),
});
