import app from "./app.js";
import connectDb from "./config/db.js";
import _config from "./config/config.js";

const startServer = async () => {
  const port = _config.port;
  //connect database
  await connectDb();

  app.listen(port, () => {
    console.log(`Server is running at port: ${port}`);
  });
};

startServer();
