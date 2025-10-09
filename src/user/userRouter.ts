import express from "express";
import userController from "./userController.js";

const userRouter = express.Router();

//Routes
userRouter.post("/register", userController);

export default userRouter;
