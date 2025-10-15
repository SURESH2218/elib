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

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    testing:'Testing whether we achieved zero down time or not through blue green deployment.',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

app.use(globalErrorHandler);

export default app;
