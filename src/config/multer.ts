import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import { s3 } from "./s3";

const isLocal = process.env.STORAGE_MODE === "local";

const localStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}${ext}`;
    cb(null, name);
  },
});

const s3Storage = multerS3({
  s3: s3 as any,
  bucket: process.env.AWS_BUCKET_NAME!,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}${ext}`;
    cb(null, `uploads/${name}`);
  },
});

export const upload = multer({
  storage: isLocal ? localStorage : s3Storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no permitido"));
    }
  },
});
