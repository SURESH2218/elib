import express from "express";
import { userLogin, userRegister } from "./userController.js";

const userRouter = express.Router();

//Routes
userRouter.post("/register", userRegister);
userRouter.post("/login", userLogin);

export default userRouter;
