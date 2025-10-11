import { config as conf } from "dotenv";
conf();

const _config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  databaseUrl: process.env.MONGO_CONNECTION_STRING as string,
  jwtsecret: process.env.JWT_SECRET,
  cloudinaryCloud: process.env.CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUD_API_KEY,
  cloudinarApiSecret: process.env.CLOUD_API_SECRET,
  frontendDomain: process.env.FRONTEND_DOMAIN
};

export default _config;
