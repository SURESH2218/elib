import { config as conf } from "dotenv";
conf();

const _config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 3000,
  databaseUrl: process.env.MONGO_CONNECTION_STRING as string,
};

export default _config;
