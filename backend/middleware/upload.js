import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads directory: backend/uploads/
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure upload dir exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Multer disk storage — save with UUID name to avoid collisions
 */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, unique);
  },
});

/**
 * Filter to allow only image types
 */
function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
  }
}

/**
 * Multer instance: max 5MB per file, max 10 files
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * URL helper to build a public URL for an uploaded file
 */
export function getFileUrl(filename) {
  const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${BASE_URL}/uploads/${filename}`;
}
