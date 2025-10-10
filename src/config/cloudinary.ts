import { v2 as cloudinary } from "cloudinary";
import _config from "./config.js";

cloudinary.config({
  cloud_name: _config.cloudinaryCloud!,
  api_key: _config.cloudinaryApiKey!,
  api_secret: _config.cloudinarApiSecret!,
});

export default cloudinary;
