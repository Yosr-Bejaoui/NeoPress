import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};


export const validateArticleStatus = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['draft', 'pending', 'published', 'rejected'])
    .withMessage('Invalid status. Must be one of: draft, pending, published, rejected'),
  handleValidationErrors
];

export const validateArticle = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('content')
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (value && value.trim().length > 0 && value.trim().length < 100) {
        throw new Error('Content must be at least 100 characters');
      }
      return true;
    }),
  
  body('category')
    .optional()
    .isIn([
      'Technology', 'Health & Wellness', 'Business & Finance', 'Politics',
      'Sports', 'Entertainment', 'Science', 'Education', 'Environment',
      'Culture & Arts', 'Travel', 'Food & Dining', 'Fashion & Style',
      'Automotive', 'Real Estate', 'Lifestyle', 'Opinion & Analysis'
    ])
    .withMessage('Invalid category'),
  
  body('region')
    .optional()
    .isIn([
      'Local', 'National', 'MENA', 'Europe', 'Asia', 'Africa',
      'North America', 'South America', 'Australia & Oceania', 'International'
    ])
    .withMessage('Invalid region'),
  
  body('status')
    .optional()
    .isIn(['draft', 'pending', 'published', 'rejected'])
    .withMessage('Invalid status'),
  
  handleValidationErrors
];

export const validateArticleCreate = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Technology', 'Health & Wellness', 'Business & Finance', 'Politics',
      'Sports', 'Entertainment', 'Science', 'Education', 'Environment',
      'Culture & Arts', 'Travel', 'Food & Dining', 'Fashion & Style',
      'Automotive', 'Real Estate', 'Lifestyle', 'Opinion & Analysis'
    ])
    .withMessage('Invalid category'),
  
  body('region')
    .optional()
    .isIn([
      'Local', 'National', 'MENA', 'Europe', 'Asia', 'Africa',
      'North America', 'South America', 'Australia & Oceania', 'International'
    ])
    .withMessage('Invalid region'),
  
  body('status')
    .optional()
    .isIn(['draft', 'pending', 'published', 'rejected'])
    .withMessage('Invalid status'),
  
  handleValidationErrors
];

export const validateArticleGeneration = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Technology', 'Health & Wellness', 'Business & Finance', 'Politics',
      'Sports', 'Entertainment', 'Science', 'Education', 'Environment',
      'Culture & Arts', 'Travel', 'Food & Dining', 'Fashion & Style',
      'Automotive', 'Real Estate', 'Lifestyle', 'Opinion & Analysis'
    ])
    .withMessage('Invalid category'),
  
  body('region')
    .notEmpty()
    .withMessage('Region is required')
    .isIn([
      'Local', 'National', 'MENA', 'Europe', 'Asia', 'Africa',
      'North America', 'South America', 'Australia & Oceania', 'International'
    ])
    .withMessage('Invalid region'),
  
  body('tone')
    .optional()
    .isIn(['neutral', 'formal', 'casual', 'analytical', 'engaging'])
    .withMessage('Invalid tone'),
  
  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Invalid language code'),
  
  handleValidationErrors
];

export const validateAdminLogin = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  handleValidationErrors
];

export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

export const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  handleValidationErrors
];

