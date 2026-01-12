import express from "express";
import { getOrders, createOrder, getOrderById } from "../controllers/ordersController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get all orders for user
router.get("/", getOrders);

// Create new order
router.post("/", createOrder);

// Get single order
router.get("/:id", getOrderById);

export default router;
