import Profile from '../models/profile.js';

// GET route to retrieve a list of all profile
const getUserProfileList = async (req, res, next) => {
  try {
    // Get all profile list (Not adding pagination for now)
    const profileList = await Profile.find({});

    return res.status(200).json(profileList);
  } catch (err) {
    next(err);
  }
};

// GET route to retrieve a profile by slug
const userProfileDetails = async (req, res, next) => {
  try {
    const { slug } = req.params; // Get the slug from the URL

    // Get user profile by slug
    const profile = await Profile.findOne({ slug });

    if (!profile) {
      return res.status(404).render('404', {});
    }

    res.render('profile_template', {
      profile
    });
  } catch (err) {
    next(err);
  }
};


// POST route to create a new profile
const createUserProfile = async (req, res, next) => {
  try {
    // Get the profile data from the request body
    const { name, description, mbti, enneagram, variant, tritype, socionics, sloan, psyche } = req.body;

    // Create a new Profile instance
    const newProfile = new Profile({
      name,
      description,
      mbti,
      enneagram,
      variant,
      tritype,
      socionics,
      sloan,
      psyche
    });

    // Save the new profile to MongoDB
    await newProfile.save();

    return res.status(200).json(newProfile);
  } catch (err) {
    /* Check for duplicate key error */
    if (err.code == 11000) {
      return res.status(400).json({ message: 'This name is already taken, please try another name.' });
    }
    next(err);
  }
};

export {
  userProfileDetails,
  createUserProfile,
  getUserProfileList
};
