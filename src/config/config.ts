import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT || 3000,
};

export default _config;
