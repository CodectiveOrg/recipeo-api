import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { formatFilenamePrefix } from "@/utils/format.utils";

export class FileService {
  public constructor(private folder: string) {
    fs.mkdir(this.folderPath, { recursive: true }).then();
  }

  private get folderPath(): string {
    return path.join(process.env.FILE_STORAGE_PATH!, this.folder);
  }

  public async save(
    file: Express.Multer.File | undefined,
  ): Promise<string | null> {
    if (!file) {
      return null;
    }

    const filename =
      formatFilenamePrefix(new Date()) + "-" + crypto.randomUUID();
    const fileExtension = file.originalname.split(".").pop();
    const filenameWithExtension = filename + "." + fileExtension;

    const filePath = path.join(this.folderPath, filenameWithExtension);
    await fs.writeFile(filePath, file.buffer);

    return filenameWithExtension;
  }

  public async load(filename: string): Promise<string | null> {
    const filePath = path.join(this.folderPath, filename);

    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      return null;
    }
  }
}
