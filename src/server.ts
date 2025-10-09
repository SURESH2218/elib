import app from "./app.js";

const startServer = () => {

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Server is running at port: ${port}`);
  });

};

startServer();
