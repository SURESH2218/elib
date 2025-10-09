import mongoose from "mongoose";
import _config from "./config.js";

const connectDb = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("connected to the database successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.log("Error in connecting to the database", err);
    });
    await mongoose.connect(_config.databaseUrl);
  } catch (error) {
    console.error("failed to connect to the database", error);
    process.exit(1);
  }
};

export default connectDb;
