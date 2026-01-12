import { db } from "../db/index.js";
import { tags } from "../db/schema.js";
import { eq, inArray } from "drizzle-orm";

// -----------------------------------------
// CREATE SINGLE TAG
// -----------------------------------------
export const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Tag name required" });

    // avoid duplicates
    const exists = await db.select().from(tags).where(eq(tags.name, name));
    if (exists.length) return res.status(400).json({ success: false, message: "Tag already exists" });

    const inserted = await db.insert(tags).values({ name }).returning();
    res.status(201).json({ success: true, data: inserted[0] });
  } catch (error) {
    console.error("CREATE TAG ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------
// BULK CREATE TAGS
// -----------------------------------------
export const createTagsBulk = async (req, res) => {
  try {
    const tagsArray = req.body; // expect array of { name }

    if (!Array.isArray(tagsArray) || !tagsArray.length) {
      return res.status(400).json({ success: false, message: "Array of tags is required" });
    }

    const names = tagsArray.map(t => t.name);

    // avoid duplicates
    const existing = await db.select({ name: tags.name }).from(tags).where(inArray(tags.name, names));
    const existingNames = existing.map(t => t.name);

    const newTags = tagsArray.filter(t => !existingNames.includes(t.name));

    if (!newTags.length) {
      return res.status(400).json({ success: false, message: "All tags already exist" });
    }

    const inserted = await db.insert(tags).values(newTags).returning();
    res.status(201).json({
      success: true,
      message: `${inserted.length} tags created successfully`,
      data: inserted
    });
  } catch (error) {
    console.error("BULK CREATE TAGS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------
// GET ALL TAGS
// -----------------------------------------
export const getTags = async (req, res) => {
  try {
    const all = await db.select().from(tags);
    res.json({ success: true, data: all });
  } catch (error) {
    console.error("GET TAGS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------
// GET TAG BY ID
// -----------------------------------------
export const getTagById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await db.select().from(tags).where(eq(tags.id, id));

    if (!result.length) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("GET TAG BY ID ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------
// UPDATE TAG
// -----------------------------------------
export const updateTag = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Check if req.body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is empty. Provide 'name' field to update."
      });
    }

    const { name } = req.body;

    const exists = await db.select().from(tags).where(eq(tags.id, id));
    if (!exists.length) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }

    // prevent duplicate names
    if (name && name !== exists[0].name) {
      const duplicate = await db.select().from(tags).where(eq(tags.name, name));
      if (duplicate.length) {
        return res.status(400).json({ success: false, message: "Tag name already exists" });
      }
    }

    const updated = await db
      .update(tags)
      .set({ name: name || exists[0].name })
      .where(eq(tags.id, id))
      .returning();

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error("UPDATE TAG ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------
// DELETE TAG
// -----------------------------------------
export const deleteTag = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const exists = await db.select().from(tags).where(eq(tags.id, id));
    if (!exists.length) return res.status(404).json({ success: false, message: "Tag not found" });

    await db.delete(tags).where(eq(tags.id, id));
    res.json({ success: true, message: "Tag deleted" });
  } catch (error) {
    console.error("DELETE TAG ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
