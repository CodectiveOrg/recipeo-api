import { Request, Response } from "express";

import { Repository } from "typeorm";

import { GetAllTagsResponseDto } from "@/dto/tag-response.dto";

import { Tag } from "@/entities/tag";

import { DatabaseService } from "@/services/database.service";

export class TagController {
  private readonly tagRepo: Repository<Tag>;

  public constructor(databaseService: DatabaseService) {
    this.tagRepo = databaseService.dataSource.getRepository(Tag);

    this.getAllTags = this.getAllTags.bind(this);
  }

  public async getAllTags(
    _: Request,
    res: Response<GetAllTagsResponseDto>,
  ): Promise<void> {
    const tags = await this.tagRepo.find();

    res.json({
      message: "All tags fetched successfully.",
      result: tags,
    });
  }
}
