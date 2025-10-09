import { type Request, type Response, type NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import _config from "../config/config.js";

const userController = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  //validations
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  //Database call
  try {
    const user = await userModel.findOne({ email });

    if (user) {
      const error = createHttpError(400, "User already Exists with this email");
      return next(error);
    }
  } catch {
    return next(createHttpError(500, "Error while checking the email"));
  }

  //password -> hash
  const hashedPassword = await bcrypt.hash(password, 10);

  let newUser;
  try {
    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
  } catch {
    return next(createHttpError(500, "Error while creating the user"));
  }

  //Token generation - jwt
  const token = jwt.sign(
    {
      sub: newUser._id,
    },
    _config.jwtsecret as string,
    { expiresIn: "7d" }
  );

  return res.status(200).json({
    _id: newUser._id,
    name: newUser.name,
    accessToken: token,
    message: "User created Successfully",
  });
};

export default userController;
