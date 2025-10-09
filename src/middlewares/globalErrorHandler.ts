import { type Request, type Response, type NextFunction } from "express";
import createHttpError from "http-errors";
import _config from "../config/config.js";

const globalErrorHandler = (
  err: createHttpError.HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    error: {
      message: err.message,
      errorStack: _config.env == "development" ? err.stack : "",
    },
  });
};

export default globalErrorHandler;
