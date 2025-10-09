import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import userRouter from "./user/userRouter.js";
import bookRouter from "./book/bookRouter.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    data: "sureshalabani",
  });
});

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

app.use(globalErrorHandler);

export default app;
