import express from "express";
import { registerAdmin, loginAdmin, getMe } from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validateAdminLogin } from "../middleware/validation.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", validateAdminLogin, loginAdmin);
router.get("/me", authMiddleware, getMe);

export default router;
