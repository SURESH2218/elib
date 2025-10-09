import app from "./app.js";
import _config from "./config/config.js";

const startServer = () => {
  const port = _config.port;

  app.listen(port, () => {
    console.log(`Server is running at port: ${port}`);
  });
  
};

startServer();
