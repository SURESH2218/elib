import { type Request, type Response, type NextFunction } from "express";
import createHttpError from "http-errors";

const userController = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  //validations
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  return res.status(200).json({
    name,
    email,
    message: "Retrieved Successfully",
  });
};

export default userController;
