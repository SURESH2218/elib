import path from "node:path";
import { fileURLToPath } from "node:url";
import cloudinary from "../config/cloudinary.js";
import createHttpError from "http-errors";
import { type Request, type Response, type NextFunction } from "express";

const createBookController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files.coverImage?.[0]) {
      return next(createHttpError(400, "cover image is required"));
    }

    if (!files.file?.[0]) {
      return next(createHttpError(400, "File is required"));
    }

    const uploadFile = async (file: Express.Multer.File, folder: string) => {
      const mimeType = file.mimetype.split("/").at(-1);
      const filePath = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "../../public/data/uploads",
        file.filename
      );
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

    return res.json({
      coverImageUrl: uploadResult[0]?.url,
      bookFileUrl: uploadResult[1]?.url,
    });
  } catch (error) {
    return next(createHttpError(500, "Error uploading files to cloudinary"));
  }
};

export { createBookController };
