import mongoose, { now } from 'mongoose';
import slugify from 'slugify';

// Define the schema for the Profile model
const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  mbti: String,
  enneagram: String,
  variant: String,
  tritype: Number,
  socionics: String,
  sloan: String,
  psyche: String,
  image: { type: String, default: 'https://boo-prod.b-cdn.net/database/profiles/168095784060007b6c942c01cda8fb25fff81fb7f1901.jpg' },
  slug: {
    type: String,
    unique: true // Ensure slugs are unique
  },
  timestamp: { type: Date, default: Date.now }
});

// Automatically generate and update the slug when saving a user profile
profileSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// Create the Profile model from the schema
const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
