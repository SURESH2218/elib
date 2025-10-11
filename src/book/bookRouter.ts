import express from "express";
import path from "node:path";
import multer from "multer";
import { fileURLToPath } from "url";
import createHttpError from "http-errors";
import {
  createBookController,
  updateBookController,
  getMyBooksController,
  getAllBooksController,
  getBookByIdController,
  deleteBookController
} from "./bookController.js";
import authenticate from "../middlewares/authenticate.js";

const bookRouter = express.Router();

//file store locally -> then we will upload this image to cloudinary or any other service like s3 and then we will delete the lcoal file
const upload = multer({
  dest: path.join(path.dirname(fileURLToPath(import.meta.url)), "../../public/data/uploads"),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB in bytes
  },

  fileFilter: (_req, file, callback) => {
    // Check file types based on field name
    if (file.fieldname === "coverImage") {
      // Allow only image files
      if (!file.mimetype.startsWith("image/")) {
        return callback(createHttpError(400, "Cover image must be an image file (JPG, PNG, etc.)"));
      }
    } else if (file.fieldname === "file") {
      // Allow only PDF files
      if (file.mimetype !== "application/pdf") {
        return callback(createHttpError(400, "Book file must be a PDF"));
      }
    }

    // If all validations pass
    callback(null, true);
  }
});

// upload.single for single file and upload.fields for multiple images

//routes
// Middleware to handle multer file validation errors
const handleMulterError = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(createHttpError(400, "File size limit exceeded (max: 10MB)"));
    }
    return next(createHttpError(400, err.message));
  }
  next(err);
};

bookRouter.post(
  "/",
  authenticate,
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1
    },
    {
      name: "file",
      maxCount: 1
    }
  ]),
  handleMulterError,
  createBookController
);

bookRouter.patch(
  "/:bookId",
  authenticate,
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1
    },
    {
      name: "file",
      maxCount: 1
    }
  ]),
  handleMulterError,
  updateBookController
);

// Public routes
bookRouter.get("/", getAllBooksController);
bookRouter.get("/my-books", authenticate, getMyBooksController);
bookRouter.get("/:bookId", getBookByIdController);
bookRouter.delete("/:bookId", authenticate, deleteBookController);

export default bookRouter;
