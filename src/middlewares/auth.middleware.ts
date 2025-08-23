import { RequestHandler } from "express";

import jwt from "jsonwebtoken";

import { TokenPayloadType } from "@/types/token-payload.type";

export const authMiddleware: RequestHandler = (req, res, next) => {
  const token = req.cookies[process.env.TOKEN_KEY!];

  if (!token) {
    res.sendStatus(401);
    return;
  }

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
