import fs from "fs";
import path from "node:path";
import bookModel from "./bookModel.js";
import { fileURLToPath } from "node:url";
import createHttpError from "http-errors";
import cloudinary from "../config/cloudinary.js";
import { type Request, type Response, type NextFunction } from "express";

const getUploadPath = (filename: string) =>
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../../public/data/uploads", filename);

const createBookController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, genre } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!title || !genre) {
      return next(createHttpError(400, "All the fields are required"));
    }
    if (!files.coverImage?.[0]) {
      return next(createHttpError(400, "cover image is required"));
    }

    if (!files.file?.[0]) {
      return next(createHttpError(400, "File is required"));
    }

    const uploadFile = async (file: Express.Multer.File, folder: string) => {
      const mimeType = file.mimetype.split("/").at(-1);
      const filePath = getUploadPath(file.filename);
      return cloudinary.uploader.upload(filePath, {
        public_id: file.filename,
        folder,
        format: mimeType as "jpg" | "pdf",
      });
    };

    const uploadResult = await Promise.all([
      uploadFile(files.coverImage[0], "book-covers"),
      uploadFile(files.file[0], "book-pdfs"),
    ]);

    const book = await bookModel.create({
      title,
      genre,
      author: "68e7f1286f91d13a6ea412d9",
      coverImage: uploadResult[0].url,
      file: uploadResult[1].url,
    });

    // delete temp files
    await Promise.all([
      fs.promises.unlink(getUploadPath(files.coverImage[0].filename)),
      fs.promises.unlink(getUploadPath(files.file[0].filename)),
    ]);

    return res.status(201).json({
      book,
    });
  } catch (error) {
    return next(createHttpError(500, "Error uploading files to cloudinary"));
  }
};

export { createBookController };
