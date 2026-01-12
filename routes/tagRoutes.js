import express from "express";
import {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
  createTagsBulk
} from "../controllers/tagsController.js";

const router = express.Router();

// Single create
router.post("/", createTag);

// Bulk create
router.post("/bulk", createTagsBulk);

// Read all
router.get("/", getTags);

// Read single
router.get("/:id", getTagById);

// Update
router.put("/:id", updateTag);

// Delete
router.delete("/:id", deleteTag);

export default router;
