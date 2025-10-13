import jwt from "jsonwebtoken";
import { logger } from "./errorHandler.js";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      message: "No token provided or invalid format" 
    });
  }

  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "No token provided" 
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET is not configured');
      return res.status(500).json({ 
        success: false,
        message: "Server configuration error" 
      });
    }

    const decoded = jwt.verify(token, jwtSecret);
    
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ 
        success: false,
        message: "Token expired" 
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    logger.warn('Invalid token attempt:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      error: err.message
    });

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expired" 
      });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token" 
      });
    } else {
      return res.status(500).json({ 
        success: false,
        message: "Token verification failed" 
      });
    }
  }
}
