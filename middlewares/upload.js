import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";

// ensure folders exist
const ensureDirs = () => {
  const folders = [
    path.join(process.cwd(), "uploads"),
    path.join(process.cwd(), "uploads", "temp"),
    path.join(process.cwd(), "uploads", "original"),
    path.join(process.cwd(), "uploads", "preview"),
    path.join(process.cwd(), "uploads", "thumb"),
  ];
  for (const f of folders) {
    if (!fs.existsSync(f)) fs.mkdirSync(f, { recursive: true });
  }
};
ensureDirs();

// multer storage (keeps extension!)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads", "temp"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${ext}`);
  },
});

// only allow common image types
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

const fileFilter = (req, file, cb) => {
  if (!ALLOWED.has(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG and WEBP images are allowed"));
  }
  cb(null, true);
};

// export multer middleware accepting array of files
export const upload = multer({ storage, fileFilter }).array("images", 10);

// PROCESS IMAGES: create thumb (150), preview (500), original (converted to jpg)
// returns nothing, but sets req.processedImages = [{ original, preview, thumbnail }, ...]
export const processImages = async (req, res, next) => {
  try {
    // if no files, just continue
    if (!req.files || req.files.length === 0) {
      req.processedImages = [];
      return next();
    }

    ensureDirs(); // ensure again, in case

    req.processedImages = [];

    for (const file of req.files) {
      const tempPath = file.path;

      // double-check file exists
      if (!fs.existsSync(tempPath)) {
        console.warn("Temp file missing:", tempPath);
        continue;
      }

      // create unique base name for outputs
      const baseName = Date.now() + "-" + Math.round(Math.random() * 1e9);

      // output filenames (jpg) — consistent for all formats (easier for frontend)
      const originalName = `${baseName}-original.jpg`;
      const previewName = `${baseName}-preview.jpg`;
      const thumbName = `${baseName}-thumb.jpg`;

      const originalPath = path.join(process.cwd(), "uploads", "original", originalName);
      const previewPath = path.join(process.cwd(), "uploads", "preview", previewName);
      const thumbPath = path.join(process.cwd(), "uploads", "thumb", thumbName);

      // Use sharp to read the temp file and write the outputs.
      // We convert outputs to JPEG to avoid format inconsistencies.
      // Process sequentially to avoid Windows file-lock issues.
      await sharp(tempPath)
        .jpeg({ quality: 90 })
        .toFile(originalPath);

      // preview  (500px width, auto height)
      await sharp(tempPath)
        .resize({ width: 500, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(previewPath);

      // thumb (150px)
      await sharp(tempPath)
        .resize({ width: 150, withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toFile(thumbPath);

      // delete the multer temporary file only AFTER successful processing
      try {
        fs.unlinkSync(tempPath);
      } catch (unlinkErr) {
        // not fatal, but log it
        console.warn("Could not delete temp file:", tempPath, unlinkErr?.message || unlinkErr);
      }

      // push just the filenames (controller expects filenames in previous code)
      req.processedImages.push({
        original: originalName,
        preview: previewName,
        thumbnail: thumbName,
      });
    }

    return next();
  } catch (err) {
    console.error("Image Processing Error:", err);
    // make error message clearer for client
    return res.status(400).json({ success: false, message: "Image processing failed: " + (err.message || err) });
  }
};
