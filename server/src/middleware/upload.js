import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

function makeStorage(subfolder) {
  const dir = path.join(process.cwd(), "uploads", subfolder);
  fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = crypto.randomBytes(8).toString("hex");
      cb(null, `${Date.now()}-${unique}${path.extname(file.originalname)}`);
    },
  });
}

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new Error("Unsupported file type"));
  }
  cb(null, true);
}

export const uploadComplaintAttachment = multer({
  storage: makeStorage("complaints"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
});

export const uploadGuardDocument = multer({
  storage: makeStorage("documents"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});
