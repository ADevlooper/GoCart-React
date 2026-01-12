// import express from "express";
// import { upload } from "../middlewares/upload.js";
// import {
//   createProduct,
//   getProducts,
//   getProductById,
//   updateProduct,
//   deleteProduct
// } from "../controllers/productsController.js";

// const router = express.Router();

// // -------------------- CREATE PRODUCT --------------------
// // Accept multiple files for three types of images
// router.post(
//   "/",
//   upload.fields([
//     { name: "thumbnail", maxCount: 1 },
//     { name: "preview", maxCount: 1 },
//     { name: "original", maxCount: 1 }
//   ]),
//   createProduct
// );

// // -------------------- GET ALL PRODUCTS --------------------
// router.get("/", getProducts);

// // -------------------- GET PRODUCT BY ID --------------------
// router.get("/:id", getProductById);

// // -------------------- UPDATE PRODUCT --------------------
// // Optional images can be replaced
// router.put(
//   "/:id",
//   upload.fields([
//     { name: "thumbnail", maxCount: 1 },
//     { name: "preview", maxCount: 1 },
//     { name: "original", maxCount: 1 }
//   ]),
//   updateProduct
// );

// // -------------------- DELETE PRODUCT --------------------
// router.delete("/:id", deleteProduct);

// export default router;
 
// routes/productsRoutes.js
import express from "express";
import { upload, processImages } from "../middlewares/upload.js";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productsController.js";

const router = express.Router();

// CREATE PRODUCT
router.post("/", upload, processImages, createProduct);

// UPDATE PRODUCT
router.put("/:id", upload, processImages, updateProduct);

// GET ALL
router.get("/", getProducts);

// GET ONE
router.get("/:id", getProductById);

// DELETE
router.delete("/:id", deleteProduct);

export default router;
