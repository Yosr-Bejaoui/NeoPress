import express from "express";
import { getDashboardStats, getArticleAnalytics, getTrendingArticles, getPerformanceOverTime } from "../controllers/analyticsController.js";

const router = express.Router();


router.get("/dashboard", getDashboardStats);
router.get("/trending", getTrendingArticles);
router.get("/performance", getPerformanceOverTime);
router.get("/articles/:id", getArticleAnalytics);

export default router;