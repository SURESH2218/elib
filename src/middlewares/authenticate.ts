import jwt from "jsonwebtoken";
import _config from "../config/config.js";
import createHttpError from "http-errors";
import { type Request, type Response, type NextFunction } from "express";

export interface AuthRequest extends Request {
  userId: string;
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");
  if (!token) {
    return next(createHttpError(401, "Token is required"));
  }

  const parsedToken = token.split(" ")[1];

  try {
    const decoded = jwt.verify(parsedToken as string, _config.jwtsecret as string);

    //   console.log("decoded", decoded);
    const _req = req as AuthRequest;

    _req.userId = decoded.sub as string;
    next();
  } catch {
    return next(createHttpError(401, "Token is invalid"));
  }
};

export default authenticate;
