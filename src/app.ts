import cors from "cors";
import express from "express";
import _config from "./config/config.js";
import userRouter from "./user/userRouter.js";
import bookRouter from "./book/bookRouter.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";

const app = express();

app.use(
  cors({
    origin: _config.frontendDomain
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    data: "sureshalabani"
  });
});

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

app.use(globalErrorHandler);

export default app;
