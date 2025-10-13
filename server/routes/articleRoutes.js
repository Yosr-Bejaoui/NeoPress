import express from "express";
import {
  getArticles,
  getArticleById,
  getArticlesByCategory,
  getArticlesByRegion,
  createArticle,
  updateArticle,
  deleteArticle,
  generateArticle,
  regenerateArticle,
  updateEngagement,
  incrementViews,
  searchArticles
} from "../controllers/articleController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { 
  validateArticle,
  validateArticleCreate,
  validateArticleStatus,
  validateArticleGeneration, 
  validateObjectId, 
  validatePagination 
} from "../middleware/validation.js";
import { articleGenerationLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();


router.get("/test", (req, res) => res.json({ message: "Test route working" }));


router.get("/", validatePagination, getArticles);
router.get("/search", validatePagination, searchArticles);
router.post("/", authMiddleware, validateArticleCreate, createArticle);


router.get("/category/:category", validatePagination, getArticlesByCategory);
router.get("/region/:region", validatePagination, getArticlesByRegion);


router.post("/generate", authMiddleware, articleGenerationLimiter, validateArticleGeneration, generateArticle);


router.get("/:id", validateObjectId, getArticleById);
router.put("/:id", authMiddleware, validateObjectId, validateArticle, updateArticle);
router.patch("/:id/status", 
  authMiddleware, 
  validateObjectId, 
  validateArticleStatus, 
  updateArticle
);
router.patch("/:id/views", validateObjectId, incrementViews);
router.patch("/:id/engagement", validateObjectId, updateEngagement);
router.put("/:id/regenerate", authMiddleware, validateObjectId, validateArticleGeneration, regenerateArticle);
router.delete("/:id", authMiddleware, validateObjectId, deleteArticle);

export default router;