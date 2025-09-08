import { RequestHandler } from "express";

import jwt from "jsonwebtoken";

import { TokenPayloadType } from "@/types/token-payload.type";

export const tokenMiddleware: RequestHandler = (req, res, next) => {
  const token = req.cookies[process.env.TOKEN_KEY!];

  try {
    res.locals.user = jwt.verify(
      token,
      process.env.TOKEN_SECRET!,
    ) as TokenPayloadType;
  } catch {
    // ignored
  }

  next();
};

export const authMiddleware: RequestHandler = (req, res, next) => {
  const token = req.cookies[process.env.TOKEN_KEY!];

  try {
    res.locals.user = jwt.verify(
      token,
      process.env.TOKEN_SECRET!,
    ) as TokenPayloadType;

    next();
  } catch {
    res.clearCookie(process.env.TOKEN_KEY!);
    res.sendStatus(401);
  }
};
