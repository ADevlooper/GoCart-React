import { db } from "../db/index.js";
import { categories } from "../db/schema.js";
import { eq, inArray } from "drizzle-orm";

// -----------------------------------------
// CREATE SINGLE CATEGORY
// -----------------------------------------
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    // Check duplicate name
    const exists = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name));

    if (exists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists"
      });
    }

    const inserted = await db
      .insert(categories)
      .values({
        name,
        description: description || null
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: inserted[0]
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category"
    });
  }
};

// -----------------------------------------
// BULK CREATE CATEGORIES
// -----------------------------------------
export const createCategoriesBulk = async (req, res) => {
  try {
    const categoriesArray = req.body; // Expect array of { name, description }

    if (!Array.isArray(categoriesArray) || !categoriesArray.length) {
      return res.status(400).json({
        success: false,
        message: "Array of categories is required"
      });
    }

    // Fetch existing category names to avoid duplicates
    const names = categoriesArray.map(c => c.name);
    const existing = await db
      .select({ name: categories.name })
      .from(categories)
      .where(inArray(categories.name, names));

    const existingNames = existing.map(c => c.name);
    const newCategories = categoriesArray.filter(c => !existingNames.includes(c.name));

    if (!newCategories.length) {
      return res.status(400).json({
        success: false,
        message: "All categories already exist"
      });
    }

    const inserted = await db.insert(categories).values(newCategories).returning();
    res.status(201).json({
      success: true,
      message: `${inserted.length} categories created successfully`,
      data: inserted
    });
  } catch (error) {
    console.error("Bulk create categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create categories"
    });
  }
};

// -----------------------------------------
// GET ALL CATEGORIES
// -----------------------------------------
export const getAllCategories = async (req, res) => {
  try {
    const all = await db.select().from(categories);
    res.json({
      success: true,
      data: all
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories"
    });
  }
};

// -----------------------------------------
// GET CATEGORY BY ID
// -----------------------------------------
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, Number(id)));

    if (!category.length) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      data: category[0]
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category"
    });
  }
};

// -----------------------------------------
// UPDATE CATEGORY
// -----------------------------------------
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const exists = await db
      .select()
      .from(categories)
      .where(eq(categories.id, Number(id)));

    if (!exists.length) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Avoid updating to a duplicate name
    if (name && name !== exists[0].name) {
      const duplicate = await db
        .select()
        .from(categories)
        .where(eq(categories.name, name));
      if (duplicate.length) {
        return res.status(400).json({
          success: false,
          message: "Another category with this name already exists"
        });
      }
    }

    const updated = await db
      .update(categories)
      .set({
        name: name || exists[0].name,
        description: description || exists[0].description
      })
      .where(eq(categories.id, Number(id)))
      .returning();

    res.json({
      success: true,
      message: "Category updated successfully",
      data: updated[0]
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category"
    });
  }
};

// -----------------------------------------
// DELETE CATEGORY
// -----------------------------------------
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const exists = await db
      .select()
      .from(categories)
      .where(eq(categories.id, Number(id)));

    if (!exists.length) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    await db.delete(categories).where(eq(categories.id, Number(id)));

    res.json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category"
    });
  }
};
