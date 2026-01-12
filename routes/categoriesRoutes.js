import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createCategoriesBulk
} from "../controllers/categoriesController.js";

const router = express.Router();

// Single create
router.post("/", createCategory);

// Bulk create
router.post("/bulk", createCategoriesBulk);

// Read all
router.get("/", getAllCategories);

// Read single
router.get("/:id", getCategoryById);

// Update
router.put("/:id", updateCategory);

// Delete
router.delete("/:id", deleteCategory);

export default router;
