import fs from "fs";
import path from "node:path";
import bookModel from "./bookModel.js";
import { fileURLToPath } from "node:url";
import createHttpError from "http-errors";
import cloudinary from "../config/cloudinary.js";
import { type Request, type Response, type NextFunction } from "express";
import type { AuthRequest } from "../middlewares/authenticate.js";

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

    const _req = req as AuthRequest;

    const book = await bookModel.create({
      title,
      genre,
      author: _req.userId,
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

const updateBookController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, genre } = req.body;
    const bookId = req.params.bookId;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // Validate if at least one field is being updated
    if (!title && !genre && !files) {
      return next(createHttpError(400, "Nothing to update"));
    }

    const book = await bookModel.findOne({ _id: bookId });

    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    const _req = req as AuthRequest;
    //checking whether the user has the access to update the book details or files
    if (book.author.toString() !== _req.userId) {
      return next(createHttpError(401, "Unauthorized"));
    }

    // Handle file uploads if any
    const uploadResults: { coverImage?: string; file?: string } = {};

    if (files) {
      const uploadFile = async (file: Express.Multer.File, folder: string) => {
        const mimeType = file.mimetype.split("/").at(-1);
        const filePath = getUploadPath(file.filename);
        return cloudinary.uploader.upload(filePath, {
          public_id: file.filename,
          folder,
          format: mimeType as "jpg" | "pdf",
        });
      };

      // Handle cover image update
      if (files.coverImage?.[0]) {
        const uploadResult = await uploadFile(files.coverImage[0], "book-covers");
        uploadResults.coverImage = uploadResult.url;
        // Delete old cover image from Cloudinary
        const oldCoverPublicId = book.coverImage.split("/").slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(`book-covers/${oldCoverPublicId}`);
      }

      // Handle book file update
      if (files.file?.[0]) {
        const uploadResult = await uploadFile(files.file[0], "book-pdfs");
        uploadResults.file = uploadResult.url;
        // Delete old PDF from Cloudinary
        const oldFilePublicId = book.file.split("/").slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(`book-pdfs/${oldFilePublicId}`);
      }

      // Clean up temporary files
      await Promise.all(
        [
          files.coverImage?.[0] && fs.promises.unlink(getUploadPath(files.coverImage[0].filename)),
          files.file?.[0] && fs.promises.unlink(getUploadPath(files.file[0].filename)),
        ].filter(Boolean)
      );
    }

    // Update book with new information
    const updatedBook = await bookModel.findByIdAndUpdate(
      bookId,
      {
        title: title || book.title,
        genre: genre || book.genre,
        coverImage: uploadResults.coverImage || book.coverImage,
        file: uploadResults.file || book.file,
      },
      { new: true }
    );

    return res.json({
      message: "Book updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.error("Update book error:", error);
    return next(createHttpError(500, "Error updating book"));
  }
};

const getMyBooksController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const _req = req as AuthRequest;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const [books, totalBooks] = await Promise.all([
      bookModel.find({ author: _req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      bookModel.countDocuments({ author: _req.userId }),
    ]);

    return res.json({
      books,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalBooks / limit),
        totalBooks,
        booksPerPage: limit,
        hasNextPage: page * limit < totalBooks,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return next(createHttpError(500, "Error fetching books"));
  }
};

const getAllBooksController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const [books, totalBooks] = await Promise.all([
      bookModel.find().populate("author", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
      bookModel.countDocuments(),
    ]);

    return res.json({
      books,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalBooks / limit),
        totalBooks,
        booksPerPage: limit,
        hasNextPage: page * limit < totalBooks,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return next(createHttpError(500, "Error fetching books"));
  }
};

const getBookByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookId } = req.params;

    const book = await bookModel.findById(bookId).populate("author", "name");

    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    return res.json({ book });
  } catch (error) {
    return next(createHttpError(500, "Error fetching book"));
  }
};

const deleteBookController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookId } = req.params;
    const _req = req as AuthRequest;

    const book = await bookModel.findById(bookId);

    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    // Check if the logged-in user is the author
    if (book.author.toString() !== _req.userId) {
      return next(createHttpError(401, "You can only delete your own books"));
    }

    // Delete files from Cloudinary
    const coverImagePublicId = book.coverImage.split("/").slice(-2).join("/").split(".")[0];
    const filePublicId = book.file.split("/").slice(-2).join("/").split(".")[0];

    await Promise.all([
      cloudinary.uploader.destroy(`book-covers/${coverImagePublicId}`),
      cloudinary.uploader.destroy(`book-pdfs/${filePublicId}`),
    ]);

    // Delete book from database
    await bookModel.findByIdAndDelete(bookId);

    return res.json({
      message: "Book deleted successfully",
      deletedBookId: bookId,
    });
  } catch (error) {
    console.error("Delete book error:", error);
    return next(createHttpError(500, "Error deleting book"));
  }
};

export {
  createBookController,
  updateBookController,
  getMyBooksController,
  getAllBooksController,
  getBookByIdController,
  deleteBookController,
};
