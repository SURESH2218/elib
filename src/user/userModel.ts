import mongoose from "mongoose";
import { type User } from "./userTypes.js";

const userSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const userModel = mongoose.model<User>("User", userSchema);

export default userModel;
