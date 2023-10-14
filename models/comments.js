import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  // associate the comment with a user profile
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  // user who created/added this comment
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  like: {
    type: Number,
    default: 0
  },
  // "voting" field as an array of subdocuments
  // Assuming here that the value of voting categories are pre defined and client will send the valid one
  votes: [
    {
      category: {
        type: String,
        enum: {
          values: ['MBTI', 'Enneagram', 'Zodiac'],
          message: 'Invalid category. Category must be one of MBTI, Enneagram, or Zodiac.'
        },
      },
      value: {
        type: String,
        required: [true, 'Value is required for votes.']
      }
    }
  ],
  timestamp: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
