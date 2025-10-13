import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

class GeminiError extends Error {
  constructor(message, type) {
    super(message);
    this.name = 'GeminiError';
    this.type = type;
  }
}

let pendingGenerations = 0;
const MAX_CONCURRENT_GENERATIONS = 5;
const GENERATION_TIMEOUT = 60000; 
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; 

const rateLimiter = {
  tokens: MAX_CONCURRENT_GENERATIONS,
  lastRefill: Date.now(),
  refillRate: 1000,

  async acquire() {
    if (pendingGenerations >= MAX_CONCURRENT_GENERATIONS) {
      throw new GeminiError(
        'Too many article generation requests. Please wait before trying again.',
        'RATE_LIMIT_ERROR'
      );
    }

    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const refillAmount = Math.floor(timePassed / this.refillRate);
    
    this.tokens = Math.min(MAX_CONCURRENT_GENERATIONS, this.tokens + refillAmount);
    this.lastRefill = now;

    if (this.tokens <= 0) {
      throw new GeminiError(
        'Rate limit exceeded. Please try again later.',
        'RATE_LIMIT_ERROR'
      );
    }

    this.tokens--;
    pendingGenerations++;
    return true;
  },

  release() {
    this.tokens = Math.min(MAX_CONCURRENT_GENERATIONS, this.tokens + 1);
    pendingGenerations = Math.max(0, pendingGenerations - 1);
  }
};

const validateApiKey = (key) => {
  if (!key) {
    throw new GeminiError(
      'GEMINI_API_KEY environment variable is not set. Please add it to your .env file.',
      'CONFIG_ERROR'
    );
  }
  
  if (!/^[A-Za-z0-9-_]+$/.test(key)) {
    throw new GeminiError(
      'Invalid GEMINI_API_KEY format. Please check your .env file.',
      'CONFIG_ERROR'
    );
  }
};

const validatePrompt = (prompt) => {
  if (!prompt || typeof prompt !== 'string') {
    throw new GeminiError('Invalid prompt: must be a non-empty string', 'VALIDATION_ERROR');
  }
  
  if (prompt.length < 10) {
    throw new GeminiError('Prompt is too short. Please provide more context.', 'VALIDATION_ERROR');
  }
  
  if (prompt.length > 30000) {
    throw new GeminiError('Prompt exceeds maximum length of 30,000 characters.', 'VALIDATION_ERROR');
  }
};

const retryWithBackoff = async (operation) => {
  let lastError;
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (error.type === 'CONFIG_ERROR' || error.type === 'VALIDATION_ERROR') {
        throw error;
      }
      
      if (error.type === 'RATE_LIMIT_ERROR' || 
          error.message.includes('timeout') ||
          error.message.includes('network')) {
        
        if (i < MAX_RETRIES - 1) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, i);
          console.log(`Retrying after ${delay}ms (attempt ${i + 1}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      throw error;
    }
  }
  
  throw lastError;
};

const apiKey = process.env.GEMINI_API_KEY;
validateApiKey(apiKey);

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    }
  ]
});

const generateArticle = async (prompt) => {
  try {
    await rateLimiter.acquire();
    
    console.log("Validating prompt...");
    validatePrompt(prompt);
    
    console.log("Sending prompt to Gemini API...");
    console.log("Prompt length:", prompt.length);
    
    const result = await retryWithBackoff(async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      if (!response) {
        throw new GeminiError("No response received from Gemini API", 'API_ERROR');
      }
      
      const text = response.text();
      if (!text || text.trim().length === 0) {
        throw new GeminiError("Empty response from Gemini API", 'API_ERROR');
      }
      
      return text;
    });
    
    console.log("✅ Generated content length:", result.length);
    return result;
    
  } catch (error) {
    console.error("❌ Gemini API Error:", {
      name: error.name,
      message: error.message,
      type: error.type || 'UNKNOWN_ERROR',
      pendingCount: pendingGenerations
    });
    
    let errorMessage = error.message;
    let errorType = error.type || 'UNKNOWN_ERROR';
    
    if (error.message.includes('not found for API version')) {
      errorMessage = 'API configuration error. Please check API version and model name.';
      errorType = 'CONFIG_ERROR';
    } else if (error.message.includes('models/')) {
      errorMessage = 'Invalid model configuration. Please check model name and settings.';
      errorType = 'CONFIG_ERROR';
    } else if (error.type === 'RATE_LIMIT_ERROR') {
      errorMessage = `Rate limit exceeded. Current pending generations: ${pendingGenerations}. Please try again in a few moments.`;
    } else if (error.type === 'TIMEOUT_ERROR') {
      errorMessage = 'Article generation timed out. Please try again.';
    } else if (error.message.includes('safety')) {
      errorMessage = 'Content was flagged by safety filters. Please adjust your prompt.';
      errorType = 'SAFETY_ERROR';
    }
    
    throw new GeminiError(
      errorMessage,
      error.type || (error.name === 'GeminiError' ? error.type : 'API_ERROR')
    );
  } finally {
    rateLimiter.release();
    console.log("Remaining pending generations:", pendingGenerations);
  }
};

export { generateArticle, GeminiError };
