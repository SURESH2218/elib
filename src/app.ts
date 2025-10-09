import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";

const app = express();

app.get("/", (req, res) => {
  res.json({
    data: "sureshalabani",
  });
});

app.use(globalErrorHandler);

export default app;
