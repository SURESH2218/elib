import express from "express";
import { createBookController } from "./bookController.js";

const bookRouter = express.Router();

//routes
bookRouter.post("/", createBookController);

export default bookRouter;
