import { Request, RequestHandler, Response } from "express";

import { Repository } from "typeorm";

import { User } from "@/entities/user";

import { DatabaseService } from "@/services/database.service";
import { FileService } from "@/services/file.service";

export class PublicController {
  private readonly fileService: FileService;

  private readonly userRepo: Repository<User>;

  public constructor(databaseService: DatabaseService) {
    this.fileService = new FileService("user");

    this.userRepo = databaseService.dataSource.getRepository(User);
  }

  public getPicture(folder: string): RequestHandler {
    async function getPicture(req: Request, res: Response): Promise<void> {
      const { filename } = req.params;

      const file = await FileService.load(folder, filename);

      if (!file) {
        res.status(404).json({
          message: "Picture not found.",
          error: "Not Found",
        });

        return;
      }

      res.sendFile(file);
    }

    return getPicture.bind(this);
  }
}
