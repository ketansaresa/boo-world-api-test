import express from 'express';
const router = express.Router();
import { userProfileDetails, getUserProfileList, createUserProfile } from './../controllers/profileController.js';
import { addComment, getComments, commentLikeToggle } from './../controllers/commentsController.js';
import { validateComment, validateCommentLikeToggle, validateProfile, handleValidationErrors } from './../middlewares/validators.js';

// routes
router.get('/:slug', userProfileDetails);
router.get('/', getUserProfileList);
router.post('/', validateProfile, handleValidationErrors, createUserProfile);
router.post('/comments', validateComment, handleValidationErrors, addComment);
router.get('/comments/:userId', getComments);
router.put('/comments/like', validateCommentLikeToggle, handleValidationErrors, commentLikeToggle);

export default router;