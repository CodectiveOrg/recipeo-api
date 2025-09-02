import { RequestHandler } from "express";

import { fileTypeFromBuffer } from "file-type";

const MAX_SIZE_MEGABYTE = 1;
const MAX_SIZE_BYTE = MAX_SIZE_MEGABYTE * 1024 * 1024;

const VALID_MIME = ["image/jpeg", "image/png", "image/webp"];
const VALID_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export const pictureMiddleware: RequestHandler = async (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }

  if (req.file.size > MAX_SIZE_BYTE) {
    res.status(400).send({
      message: `The file size should not exceed ${MAX_SIZE_MEGABYTE}MB.`,
      error: "Bad Request",
    });

    return;
  }

  if (!(await hasValidFileType(req.file))) {
    res.status(400).send({
      message: "Please upload a valid jpg, png or webp image.",
      error: "Bad Request",
    });

    return;
  }

  next();
};

export const hasValidFileType = async (
  file: Express.Multer.File,
): Promise<boolean> => {
  const extension = file.originalname.split(".").pop();
  if (!extension || !VALID_EXTENSIONS.includes(extension)) {
    return false;
  }

  try {
    const fileType = await fileTypeFromBuffer(file.buffer);
    return !!fileType && VALID_MIME.includes(fileType.mime);
  } catch {
    return false;
  }
};
