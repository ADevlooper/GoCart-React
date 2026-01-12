// authRoutes.js
import express from "express";
import { register, login, getProfile, updateProfile, logout } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getProfile);
router.put("/update", requireAuth, updateProfile);
router.post("/logout", requireAuth, logout);


export default router;
