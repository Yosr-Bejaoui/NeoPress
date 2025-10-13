import express from "express";
import {
  getTunisiaNews,
  getMenaNews,
  getPopularNews,
  getWorldNews,
  getNewsByCategory,
  searchNews
} from "../controllers/newsController.js";

const router = express.Router();

router.get("/health", async (req, res) => {
  const sources = {
    newsapi: !!process.env.NEWSAPI_API_KEY,
    gnews: !!process.env.GNEWS_API_KEY,
    newsdata: !!process.env.NEWSDATA_API_KEY,
    guardian: !!process.env.GUARDIAN_API_KEY,
    currents: !!process.env.CURRENTS_API_KEY
  };
  
  const activeCount = Object.values(sources).filter(Boolean).length;
  
  res.json({
    success: true,
    message: `${activeCount} of 5 news sources configured`,
    sources,
    totalSources: 5,
    activeSources: activeCount,
    recommendation: activeCount < 2 
      ? "Add more API keys for better coverage. See MULTI_SOURCE_NEWS_SETUP.md" 
      : activeCount < 3
      ? "Good! Consider adding 1-2 more sources for redundancy"
      : "Excellent! You have multiple sources configured"
  });
});

router.get("/", getTunisiaNews);         
router.get("/tunisia", getTunisiaNews);   
router.get("/mena", getMenaNews);         


router.get("/category/:category", getNewsByCategory); 

router.get("/popular", getPopularNews);    
router.get("/world", getWorldNews);        


router.get("/search", searchNews);         

export default router;