import { NextFunction, Request, Response } from "express";

import { z } from "zod";

import { ResponseDto } from "@/dto/response.dto";

export async function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response<ResponseDto>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): Promise<void> {
  if (err instanceof z.ZodError) {
    res.status(400).send({
      message: err.issues.map((issue) => issue.message).join("\n"),
      error: "Bad Request",
    });
  } else if (err instanceof Error) {
    res.status(500).send({
      message: err.message,
      error: "Internal Server Error",
    });
  } else {
    res.status(500).send({
      message: "Internal server error",
      error: "Internal Server Error",
    });
  }
}
