// import fs from "fs";
// import path from "path";
// import sharp from "sharp";

// import { db } from "../db/index.js";
// import {
//   products,
//   categories,
//   tags,
//   productTags,
//   productCategories,
//   productImages
// } from "../db/schema.js";
// import { eq, inArray } from "drizzle-orm";

// // Helper: safe parse JSON fields
// const safeParseJSON = (val, fallback = []) => {
//   if (!val) return fallback;
//   if (typeof val === "object") return val;
//   try {
//     return JSON.parse(val);
//   } catch {
//     return fallback;
//   }
// };

// // Helper: ensure array of numbers
// const toNumberArray = (arr) => (Array.isArray(arr) ? arr.map(Number).filter(n => !Number.isNaN(n)) : []);

// // Helpers for file paths
// const uploadsDir = path.join(process.cwd(), "uploads");

// const ensureUploadsDir = () => {
//   if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
// };

// // Delete file helper (best-effort)
// const deleteFileIfExists = (filePath) => {
//   try {
//     if (!filePath) return;
//     // filePath expected like '/uploads/filename.ext' or 'uploads/filename.ext'
//     const rel = filePath.startsWith("/") ? filePath.slice(1) : filePath;
//     const abs = path.join(process.cwd(), rel);
//     if (fs.existsSync(abs)) fs.unlinkSync(abs);
//   } catch (err) {
//     console.warn("Failed to delete file:", err.message);
//   }
// };

// // Process a single uploaded original file (from multer single 'image')
// // Returns array of objects suitable for product_images insert: { productId, type, url, altText, position }
// const processSingleOriginalAndGenerateVariants = async (file, productId, title) => {
//   ensureUploadsDir();
//   // file: { path, filename, originalname, mimetype } (multer)
//   const originalFilename = file.filename; // multer generated unique name
//   const originalPath = path.join(uploadsDir, originalFilename);

//   // derive preview and thumbnail filenames
//   const base = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//   const ext = path.extname(file.originalname) || path.extname(originalFilename) || ".jpg";

//   const previewFilename = `preview-${base}${ext}`;
//   const thumbnailFilename = `thumb-${base}${ext}`;

//   const previewPath = path.join(uploadsDir, previewFilename);
//   const thumbnailPath = path.join(uploadsDir, thumbnailFilename);

//   // Create Preview (800x800, cover)
//   await sharp(originalPath)
//     .resize(800, 800, { fit: "cover", position: "center" })
//     .toFile(previewPath);

//   // Create Thumbnail (200x200, cover)
//   await sharp(originalPath)
//     .resize(200, 200, { fit: "cover", position: "center" })
//     .toFile(thumbnailPath);

//   // Build image rows
//   const uploaded = [
//     {
//       productId,
//       type: "original",
//       url: `/uploads/${originalFilename}`,
//       altText: title,
//       position: 0
//     },
//     {
//       productId,
//       type: "preview",
//       url: `/uploads/${previewFilename}`,
//       altText: title,
//       position: 0
//     },
//     {
//       productId,
//       type: "thumbnail",
//       url: `/uploads/${thumbnailFilename}`,
//       altText: title,
//       position: 0
//     }
//   ];

//   return uploaded;
// };

// // -------------------- CREATE PRODUCT --------------------
// export const createProduct = async (req, res) => {
//   try {
//     const body = req.body;

//     const title = body.title;
//     const description = body.description;
//     const price = body.price;
//     const stock = body.stock;
//     const availableStock = body.availableStock;

//     if (!title || !description || !price || !stock || !availableStock) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }

//     // categoryIds expected as JSON array
//     const categoryIds = toNumberArray(safeParseJSON(body.categoryIds, []));
//     if (!categoryIds.length) return res.status(400).json({ success: false, message: "categoryIds is required" });

//     // validate categories exist
//     const existingCats = await db.select({ id: categories.id }).from(categories).where(inArray(categories.id, categoryIds));
//     const existingCatIds = existingCats.map(c => c.id);
//     if (existingCatIds.length !== categoryIds.length) {
//       return res.status(400).json({ success: false, message: "One or more categoryIds are invalid" });
//     }

//     // handle tags (names or ids)
//     const rawTags = safeParseJSON(body.tags, []);
//     const tagNames = rawTags.filter(x => typeof x === "string");
//     const tagIdsFromClient = toNumberArray(rawTags.filter(x => typeof x === "number"));
//     let finalTagIds = [...tagIdsFromClient];

//     if (tagNames.length) {
//       const existingTags = await db.select({ id: tags.id, name: tags.name }).from(tags).where(inArray(tags.name, tagNames));
//       const existingTagNames = existingTags.map(t => t.name);
//       const existingTagMap = Object.fromEntries(existingTags.map(t => [t.name, t.id]));
//       const newTagNames = tagNames.filter(n => !existingTagNames.includes(n));

//       if (newTagNames.length) {
//         const inserted = await db.insert(tags).values(newTagNames.map(n => ({ name: n }))).returning();
//         inserted.forEach(t => finalTagIds.push(t.id));
//       }
//       Object.values(existingTagMap).forEach(id => finalTagIds.push(id));
//     }

//     finalTagIds = Array.from(new Set(finalTagIds));

//     // -------------------- insert product --------------------
//     const inserted = await db.insert(products).values({
//       title,
//       description,
//       price: String(price),
//       discount: String(body.discount || "0"),
//       stock: Number(stock),
//       availableStock: Number(availableStock),
//       brand: body.brand || null,
//       warrantyInfo: body.warrantyInfo || null,
//     }).returning();

//     const product = inserted[0];

//     // -------------------- insert product_categories --------------------
//     if (categoryIds.length) {
//       await db.insert(productCategories).values(categoryIds.map(catId => ({ productId: product.id, categoryId: catId })));
//     }

//     // -------------------- insert product_tags --------------------
//     if (finalTagIds.length) {
//       await db.insert(productTags).values(finalTagIds.map(tagId => ({ productId: product.id, tagId })));
//     }

//     // -------------------- insert images --------------------
//     // Two flows supported:
//     // 1) Client uploaded three separate fields: req.files.thumbnail / preview / original (existing behavior)
//     // 2) Client uploaded a single original file as req.file (field name 'image') -> we'll generate preview+thumb via sharp
//     const uploadedImages = [];

//     // CASE A: client sent separate named fields (thumbnail, preview, original)
//     const types = ["thumbnail", "preview", "original"];
//     if (req.files && Object.keys(req.files).length) {
//       for (const type of types) {
//         if (req.files[type]) {
//           for (let i = 0; i < req.files[type].length; i++) {
//             const file = req.files[type][i];
//             uploadedImages.push({
//               productId: product.id,
//               type,
//               url: `/uploads/${file.filename}`,
//               altText: title,
//               position: i
//             });
//           }
//         }
//       }
//     }

//     // CASE B: client uploaded a single file as req.file (single upload - field 'image')
//     if (req.file) {
//       const generated = await processSingleOriginalAndGenerateVariants(req.file, product.id, title);
//       uploadedImages.push(...generated);
//     }

//     if (uploadedImages.length) {
//       await db.insert(productImages).values(uploadedImages);
//     }

//     // -------------------- return full product --------------------
//     const fullProduct = await getFullProduct(product.id);
//     res.status(201).json({ success: true, product: fullProduct });

//   } catch (error) {
//     console.error("CREATE PRODUCT ERROR:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // -------------------- GET ALL PRODUCTS --------------------
// export const getProducts = async (req, res) => {
//   try {
//     const prods = await db.select().from(products);
//     const result = await Promise.all(prods.map(p => getFullProduct(p.id)));
//     res.status(200).json({ success: true, products: result });
//   } catch (error) {
//     console.error("GET PRODUCTS ERROR:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // -------------------- GET PRODUCT BY ID --------------------
// export const getProductById = async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     const product = await getFullProduct(id);
//     if (!product) return res.status(404).json({ success: false, message: "Product not found" });
//     res.status(200).json({ success: true, product });
//   } catch (error) {
//     console.error("GET PRODUCT BY ID ERROR:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // -------------------- UPDATE PRODUCT --------------------
// export const updateProduct = async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     const body = req.body;

//     const prods = await db.select().from(products).where(eq(products.id, id));
//     if (!prods.length) return res.status(404).json({ success: false, message: "Product not found" });
//     const old = prods[0];

//     // update product fields
//     const updated = await db.update(products).set({
//       title: body.title || old.title,
//       description: body.description || old.description,
//       price: body.price ? String(body.price) : old.price,
//       discount: body.discount ? String(body.discount) : old.discount,
//       stock: body.stock ? Number(body.stock) : old.stock,
//       availableStock: body.availableStock ? Number(body.availableStock) : old.availableStock,
//       brand: body.brand ?? old.brand,
//       warrantyInfo: body.warrantyInfo ?? old.warrantyInfo,
//       updatedAt: new Date()
//     }).where(eq(products.id, id)).returning();

//     // -------------------- update categories --------------------
//     if (body.categoryIds) {
//       const categoryIds = toNumberArray(safeParseJSON(body.categoryIds, []));
//       const existingCats = await db.select({ id: categories.id }).from(categories).where(inArray(categories.id, categoryIds));
//       if (existingCats.length !== categoryIds.length)
//         return res.status(400).json({ success: false, message: "One or more categoryIds are invalid" });

//       await db.delete(productCategories).where(eq(productCategories.productId, id));
//       if (categoryIds.length) await db.insert(productCategories).values(categoryIds.map(catId => ({ productId: id, categoryId: catId })));
//     }

//     // -------------------- update tags --------------------
//     if (body.tags) {
//       const rawTags = safeParseJSON(body.tags, []);
//       const tagNames = rawTags.filter(x => typeof x === "string");
//       const tagIdsFromClient = toNumberArray(rawTags.filter(x => typeof x === "number"));
//       let finalTagIds = [...tagIdsFromClient];

//       if (tagNames.length) {
//         const existingTags = await db.select({ id: tags.id, name: tags.name }).from(tags).where(inArray(tags.name, tagNames));
//         const existingTagNames = existingTags.map(t => t.name);
//         const existingTagMap = Object.fromEntries(existingTags.map(t => [t.name, t.id]));
//         const newTagNames = tagNames.filter(n => !existingTagNames.includes(n));

//         if (newTagNames.length) {
//           const inserted = await db.insert(tags).values(newTagNames.map(n => ({ name: n }))).returning();
//           inserted.forEach(t => finalTagIds.push(t.id));
//         }
//         Object.values(existingTagMap).forEach(id => finalTagIds.push(id));
//       }

//       finalTagIds = Array.from(new Set(finalTagIds));

//       await db.delete(productTags).where(eq(productTags.productId, id));
//       if (finalTagIds.length) await db.insert(productTags).values(finalTagIds.map(tagId => ({ productId: id, tagId })));
//     }

//     // -------------------- update images --------------------
//     // Two flows:
//     // - If req.files with typed fields (thumbnail/preview/original) -> stick to previous behavior
//     // - If req.file single uploaded 'image' -> generate preview and thumbnail and replace old images
//     const types = ["thumbnail", "preview", "original"];

//     // CASE A: typed fields in req.files (existing behavior) - remove old ones of each type and insert new
//     if (req.files && Object.keys(req.files).length) {
//       for (const type of types) {
//         if (req.files[type]) {
//           // remove old images of this type (DB rows)
//           const oldRows = await db.select().from(productImages).where(eq(productImages.productId, id)).where(eq(productImages.type, type));
//           // delete files from disk
//           oldRows.forEach(r => deleteFileIfExists(r.url));

//           await db.delete(productImages).where(eq(productImages.productId, id)).where(eq(productImages.type, type));

//           // insert new ones
//           const imgs = [];
//           for (let i = 0; i < req.files[type].length; i++) {
//             const file = req.files[type][i];
//             imgs.push({
//               productId: id,
//               type,
//               url: `/uploads/${file.filename}`,
//               altText: body.title || old.title,
//               position: i
//             });
//           }
//           if (imgs.length) await db.insert(productImages).values(imgs);
//         }
//       }
//     }

//     // CASE B: single file uploaded as req.file (field 'image') -> generate and replace all three types
//     if (req.file) {
//       // get existing images for this product and delete files & rows
//       const existingImgs = await db.select().from(productImages).where(eq(productImages.productId, id));
//       existingImgs.forEach(r => deleteFileIfExists(r.url));
//       await db.delete(productImages).where(eq(productImages.productId, id));

//       // process uploaded single file and generate 3 variants
//       const generated = await processSingleOriginalAndGenerateVariants(req.file, id, body.title || old.title);
//       if (generated.length) await db.insert(productImages).values(generated);
//     }

//     const fullProduct = await getFullProduct(id);
//     res.status(200).json({ success: true, product: fullProduct });

//   } catch (error) {
//     console.error("UPDATE PRODUCT ERROR:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // -------------------- DELETE PRODUCT --------------------
// export const deleteProduct = async (req, res) => {
//   try {
//     const id = Number(req.params.id);

//     // delete image files from disk (best-effort)
//     const imgs = await db.select().from(productImages).where(eq(productImages.productId, id));
//     imgs.forEach(r => deleteFileIfExists(r.url));

//     const deleted = await db.delete(products).where(eq(products.id, id)).returning();
//     // productImages rows are cascaded by DB foreign key onDelete: cascade

//     res.status(200).json({ success: true, deleted: deleted[0] });
//   } catch (error) {
//     console.error("DELETE PRODUCT ERROR:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // -------------------- Helper: fetch full product --------------------
// const getFullProduct = async (productId) => {
//   const prods = await db.select().from(products).where(eq(products.id, productId));
//   if (!prods.length) return null;
//   const p = prods[0];

//   // categories
//   const pcRows = await db.select({
//     productId: productCategories.productId,
//     categoryId: productCategories.categoryId,
//     categoryName: categories.name
//   }).from(productCategories).leftJoin(categories, eq(productCategories.categoryId, categories.id))
//     .where(eq(productCategories.productId, productId));

//   // tags
//   const ptRows = await db.select({
//     productId: productTags.productId,
//     tagId: productTags.tagId,
//     tagName: tags.name
//   }).from(productTags).leftJoin(tags, eq(productTags.tagId, tags.id))
//     .where(eq(productTags.productId, productId));

//   // images
//   const imgRows = await db.select().from(productImages).where(eq(productImages.productId, productId));
//   const images = { thumbnail: null, preview: null, original: null };
//   imgRows.forEach(img => images[img.type] = img.url);

//   return {
//     id: p.id,
//     title: p.title,
//     description: p.description,
//     price: p.price,
//     discount: p.discount,
//     stock: p.stock,
//     availableStock: p.availableStock,
//     brand: p.brand,
//     warrantyInfo: p.warrantyInfo,
//     categories: pcRows.map(r => ({ id: r.categoryId, name: r.categoryName })),
//     tags: ptRows.map(r => ({ id: r.tagId, name: r.tagName })),
//     images
//   };
// };

import { db } from "../db/index.js";
import {
  products,
  productCategories,
  productTags,
  productImages,
  categories,
  tags,
  wishlist,
} from "../db/schema.js";
import { eq, inArray } from "drizzle-orm";

// -------------------------------------------------------------
// CREATE PRODUCT (now accepts 4 images → each processed)
// -------------------------------------------------------------
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discount,
      stock,
      availableStock,
      brand,
      warrantyInfo,
      categoryIds,
      tags: tagIds,
    } = req.body;

    // Validate required fields
    if (!title || !description || price === undefined || stock === undefined || availableStock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, description, price, stock, availableStock"
      });
    }

    // Parse arrays - handle both string and array inputs
    let categoryArray = [];
    let tagArray = [];

    try {
      categoryArray = typeof categoryIds === 'string' ? JSON.parse(categoryIds) : (Array.isArray(categoryIds) ? categoryIds : []);
      tagArray = typeof tagIds === 'string' ? JSON.parse(tagIds) : (Array.isArray(tagIds) ? tagIds : []);
    } catch (e) {
      console.warn('Failed to parse categoryIds or tags:', e);
    }

    // Create product with numeric fields
    const [newProduct] = await db
      .insert(products)
      .values({
        title,
        description,
        price: String(price),
        discount: String(discount || 0),
        stock: Number(stock),
        availableStock: Number(availableStock),
        brand: brand || null,
        warrantyInfo: warrantyInfo || null,
      })
      .returning();

    const productId = newProduct.id;

    // Insert categories
    if (categoryArray.length > 0) {
      const rows = categoryArray.map((cid) => ({
        productId,
        categoryId: Number(cid),
      }));
      await db.insert(productCategories).values(rows);
    }

    // Insert tags
    if (tagArray.length > 0) {
      const rows = tagArray.map((tid) => ({
        productId,
        tagId: Number(tid),
      }));
      await db.insert(productTags).values(rows);
    }

    // Insert all processed images (4 images × 3 versions) if provided
    if (req.processedImages?.length > 0) {
      let position = 0;

      for (const img of req.processedImages) {
        await db.insert(productImages).values({
          productId,
          originalUrl: `/uploads/original/${img.original}`,
          thumbnailUrl: `/uploads/thumb/${img.thumbnail}`,
          previewUrl: `/uploads/preview/${img.preview}`,
          position: position++,
        });
      }
    }

    return res.json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------
// GET ALL PRODUCTS
// -------------------------------------------------------------
export const getProducts = async (req, res) => {
  try {
    const rows = await db.select().from(products);
    const final = [];

    for (const p of rows) {
      const categoryNames =
        await db.select({ name: categories.name })
          .from(productCategories)
          .leftJoin(categories, eq(productCategories.categoryId, categories.id))
          .where(eq(productCategories.productId, p.id));

      const tagNames =
        await db.select({ name: tags.name })
          .from(productTags)
          .leftJoin(tags, eq(productTags.tagId, tags.id))
          .where(eq(productTags.productId, p.id));

      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, p.id));

      final.push({
        ...p,
        categories: categoryNames.map((c) => c.name),
        tags: tagNames.map((t) => t.name),
        images: images.map((img) => ({
          thumbnail: img.thumbnailUrl,
          preview: img.previewUrl,
          original: img.originalUrl,
        })),
      });
    }

    return res.json({ success: true, data: final });
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({ success: false });
  }
};

// -------------------------------------------------------------
// GET PRODUCT BY ID
// -------------------------------------------------------------
export const getProductById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product)
      return res.status(404).json({ success: false, message: "Not found" });

    const categoryNames =
      await db.select({ name: categories.name })
        .from(productCategories)
        .leftJoin(categories, eq(productCategories.categoryId, categories.id))
        .where(eq(productCategories.productId, id));

    const tagNames =
      await db.select({ name: tags.name })
        .from(productTags)
        .leftJoin(tags, eq(productTags.tagId, tags.id))
        .where(eq(productTags.productId, id));

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id));

    return res.json({
      success: true,
      data: {
        ...product,
        categories: categoryNames.map((c) => c.name),
        tags: tagNames.map((t) => t.name),
        images: images.map((img) => ({
          id: img.id,
          thumbnail: img.thumbnailUrl,
          preview: img.previewUrl,
          original: img.originalUrl,
        })),
      },
    });
  } catch (error) {
    console.error("Get Product Error:", error);
    return res.status(500).json({ success: false });
  }
};

// -------------------------------------------------------------
// UPDATE PRODUCT (also update categories/tags)
// -------------------------------------------------------------
export const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body;

    const categoryArray = body.categoryIds ? JSON.parse(body.categoryIds) : null;
    const tagArray = body.tags ? JSON.parse(body.tags) : null;

    const updateData = { ...body };
    delete updateData.categoryIds;
    delete updateData.tags;

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    if (!updated)
      return res.status(404).json({ success: false, message: "Product not found" });

    // Update categories
    if (categoryArray) {
      await db.delete(productCategories).where(eq(productCategories.productId, id));
      await db.insert(productCategories).values(
        categoryArray.map((c) => ({ productId: id, categoryId: Number(c) }))
      );
    }

    // Update tags
    if (tagArray) {
      await db.delete(productTags).where(eq(productTags.productId, id));
      await db.insert(productTags).values(
        tagArray.map((t) => ({ productId: id, tagId: Number(t) }))
      );
    }

    // Handle Image Deletions
    if (body.deletedImageIds) {
      let idsToDelete = [];
      try {
        idsToDelete = JSON.parse(body.deletedImageIds);
      } catch (e) {
        console.warn("Failed to parse deletedImageIds", e);
      }

      if (Array.isArray(idsToDelete) && idsToDelete.length > 0) {
        await db
          .delete(productImages)
          .where(inArray(productImages.id, idsToDelete));
      }
    }

    // Add New Images (append)
    if (req.processedImages?.length > 0) {
      // simple append with incrementing position from 0 (or could query max position)
      let position = 0;
      for (const img of req.processedImages) {
        await db.insert(productImages).values({
          productId: id,
          originalUrl: `/uploads/original/${img.original}`,
          thumbnailUrl: `/uploads/thumb/${img.thumbnail}`,
          previewUrl: `/uploads/preview/${img.preview}`,
          position: position++,
        });
      }
    }

    return res.json({ success: true, message: "Product updated", data: updated });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({ success: false });
  }
};

// -------------------------------------------------------------
// DELETE PRODUCT
// -------------------------------------------------------------
export const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await db.delete(productImages).where(eq(productImages.productId, id));
    await db.delete(productCategories).where(eq(productCategories.productId, id));
    await db.delete(productTags).where(eq(productTags.productId, id));
    await db.delete(products).where(eq(products.id, id));

    return res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({ success: false });
  }
};
