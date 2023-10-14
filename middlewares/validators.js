import { validationResult, check } from 'express-validator';

// Custom middleware for validating comments
export const validateComment = [
  check('userId', 'userId is required').notEmpty(),
  check('ownerId', 'ownerId is required').notEmpty(),
  check('votes').custom((value, { req }) => {
    if (!value && !req.body.title) {
      throw new Error('Either votes or title should exist.');
    }
    if (value) {
      if (!Array.isArray(value)) {
        throw new Error('votes must be an array');
      }
      if (value.length === 0) {
        throw new Error('votes must have at least one element');
      }
      if (!value.every((item) => typeof item === 'object' && 'category' in item && 'value' in item)) {
        throw new Error('Each vote must have both "category" and "value" keys.');
      }
    }
    return true;
  }),
  check('title').custom((value, { req }) => {
    if (!value && !req.body.votes) {
      throw new Error('Either votes or title should exist.');
    }
    if (value && typeof value !== 'string') {
      throw new Error('title must be a string');
    }
    return true;
  }),
];

// Custom middleware for validating user profile
export const validateProfile = [
  check('name', 'name is required').notEmpty(),
  check('tritype').optional().isNumeric().withMessage('tritype must be of type number')
];

// Custom middleware for validating comment like unlike
export const validateCommentLikeToggle = [
  check('commentId', 'commentId is required').notEmpty(),
  check('like').isBoolean().withMessage('like must be of type boolean')
];

// Middleware function to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
