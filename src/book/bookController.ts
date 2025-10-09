import { type Request, type Response, type NextFunction } from "express";

const createBookController = async (req: Request, res: Response, next: NextFunction) => {
  return res.json({});
};

export { createBookController };
