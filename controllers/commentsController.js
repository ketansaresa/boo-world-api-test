import mongoose from 'mongoose';
import Comments from '../models/comments.js';
import Profile from '../models/profile.js';

// POST route to add new comment
const addComment = async (req, res, next) => {
  try {
    // Get data from body
    const { userId, ownerId, title, description, votes } = req.body;

    /* Check if users are valid */
    const [userInfo, ownerInfo] = await Promise.all([
      Profile.findOne({ _id: new mongoose.Types.ObjectId(userId) }),
      Profile.findOne({ _id: new mongoose.Types.ObjectId(ownerId) })
    ]);

    if (!userInfo || !ownerInfo) {
      return res.status(404).json({ message: 'User account not found!' });
    }

    // Add new comment
    const newComment = new Comments({
      userId,
      title,
      description,
      owner: ownerId,
      votes // Assuming that client has list of valid categories
    });

    await newComment.save();

    return res.status(200).json(newComment);
  } catch (err) {
    next(err);
  }
};

// GET route for list of comments
const getComments = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { sortBy = 'recent', filterBy } = req.query;

    // Create a filter object with the userId
    const filterObj = {
      userId,
    };

    // Create a sort object based on the sortBy parameter
    const sortObj = {};
    if (sortBy === 'best') {
      sortObj.like = -1;
    } else {
      sortObj.timestamp = -1;
    }

    // If filterBy is specified, add it to the filter object
    if (filterBy && ['MBTI', 'Enneagram', 'Zodiac'].includes(filterBy)) {
      filterObj['votes.category'] = filterBy;
    }

    // Get comments by userId with optional sorting and filtering
    const comments = await Comments.find(filterObj)
      .sort(sortObj)
      .populate({
        path: 'owner',
        select: 'name image'
      });

    return res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};

// PUT route for comment like/unlike
const commentLikeToggle = async (req, res, next) => {
  try {
    const { commentId, like } = req.body;

    // Find the comment by its ID
    const comment = await Comments.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Ensure the like field doesn't go negative
    if (!like && comment.like <= 0) {
      return res.status(400).json({ message: 'Comment like count cannot go negative' });
    }

    // Increment or decrement the like field based on the 'like' parameter
    comment.like = like ? comment.like + 1 : comment.like - 1;

    await comment.save();

    return res.status(200).json({ message: `Comment ${like ? 'liked' : 'unliked'} successfully` });
  } catch (err) {
    next(err);
  }
};


export {
  addComment,
  getComments,
  commentLikeToggle
};
