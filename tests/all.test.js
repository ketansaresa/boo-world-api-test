import request from 'supertest';
import app from './../app'
import Profile from '../models/profile';
import Comments from '../models/comments';

describe('GET /user-profile-list', () => {
  it('should return a list of user profiles', async () => {
    // Create some sample profiles for testing
    const sampleProfiles = [
      { name: 'Profile A', description: 'Description 1', mbti: 'ISFJ', enneagram: '9w3' },
      { name: 'Profile B', description: 'Description 2', mbti: 'INTP', enneagram: '9w5' },
    ];

    // Insert the sample profiles into the database
    const promises = sampleProfiles.map(profile => {
      return Profile.create(profile);
    });
    await Promise.all(promises);

    // Make a GET request to the endpoint
    const response = await request(app).get('/');

    // Assert that the response status code is 200 (OK)
    expect(response.statusCode).toBe(200);

    // Assert that the response body is an array (list of profiles)
    expect(Array.isArray(response.body)).toBe(true);

    // Assert that the response body contains the sample profiles
    for (const profile of sampleProfiles) {
      expect(response.body).toContainEqual(expect.objectContaining(profile));
    }
  });
});

describe('GET /user-profile/:slug', () => {
  it('should return a user profile by slug', async () => {
    // Make a GET request to the endpoint with the sample slug
    const response = await request(app).get(`/profile-a`);

    // Assert that the response status code is 200 (OK)
    expect(response.statusCode).toBe(200);

    // Assert that the response content type is "text/html"
    expect(response.headers['content-type']).toContain('text/html');

  });

  it('should return a 404 error for non-existent slug', async () => {
    // Make a GET request to the endpoint with a non-existent slug
    const response = await request(app).get('/non-existent-slug');

    // Assert that the response status code is 404 (Not Found)
    expect(response.statusCode).toBe(404);
  });
});

describe('POST /user-profile', () => {

  it('should create a new user profile', async () => {
    const userProfileData = {
      name: 'Test User',
      description: 'Test description',
      mbti: 'ISFJ',
      enneagram: '9w3',
      variant: 'sp/so',
      tritype: 725,
      socionics: 'SEE',
      sloan: 'RCOEN',
      psyche: 'FEVL',
    };

    // Send a POST request to create a new user profile
    const response = await request(app)
      .post('/')
      .send(userProfileData)
      .set('Content-Type', 'application/json');

    // Expect the response status code to be 200 (OK)
    expect(response.status).toBe(200);

    // Expect the response body to contain the created profile data
    expect(response.body).toMatchObject(userProfileData);

    // Expect the profile to be saved in the database
    const savedProfile = await Profile.findOne({ slug: response.body.slug });
    expect(savedProfile).toBeTruthy();
  });

  it('should handle duplicate name error', async () => {
    // Create a profile with a duplicate name
    const duplicateUserProfileData = {
      name: 'Test User',
      description: 'Test description',
    };

    // Attempt to create a new profile with the same name
    const response = await request(app)
      .post('/')
      .send(duplicateUserProfileData);

    // Expect the response status code to be 400 (Bad Request) due to duplicate name
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'This name is already taken, please try another name.');
  });
});

describe('POST /comments', () => {
  it('should add a new comment', async () => {
    const userProfile = await Profile.find().limit(2);
    const commentData = {
      userId: userProfile[0]._id.toString(), // Use the created user's ID
      ownerId: userProfile[1]._id.toString(), // Use the same user's ID as the owner
      title: 'Test Comment',
      description: 'This is a test comment',
      votes: [{ category: 'MBTI', value: 'ISFJ' }],
    };

    // Send a POST request to add a new comment
    const response = await request(app)
      .post('/comments')
      .send(commentData)
      .set('Content-Type', 'application/json');

    // Expect the response status code to be 200 (OK)
    expect(response.status).toBe(200);

    // Expect the comment to be saved in the database
    const savedComment = await Comments.findById(response.body._id);
    expect(savedComment).toBeTruthy();
  });

  it('should handle user not found error', async () => {
    const commentData = {
      "votes": [{ "category": "MBTI", "value": "IJKL" }, { "category": "Enneagram", "value": "9w3" }],
      "title": "Title Sample",
      "description": "Comment Description",
      "userId": "652aa81b227c708d9674ba51",
      "ownerId": "652aa81b227c708d9674ba51"
    };

    // Send a POST request to add a new comment with an invalid user ID
    const response = await request(app)
      .post('/comments')
      .send(commentData)
      .set('Content-Type', 'application/json');

    // Expect the response status code to be 404 due to user not found
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'User account not found!');
  });
});

describe('GET /comments/:userId', () => {
  it('should return a list of comments for a user', async () => {
    // Get sample comment
    const sampleComment = await Comments.findOne();

    // Make a GET request to the endpoint
    const response = await request(app)
      .get(`/comments/${sampleComment.userId}`)
      .query({ sortBy: 'best', filterBy: 'MBTI' });

    // Assert that the response status code is 200 (OK)
    expect(response.status).toBe(200);

    // Assert that the response body is an array (list of comments)
    expect(Array.isArray(response.body)).toBe(true);

    // Assert that the response body contains the expected comments
    for (const comment of response.body) {
      expect(response.body).toContainEqual(expect.objectContaining({ userId: comment.userId }));
    }
  });
});

describe('PUT /comments/like', () => {
  it('should successfully like a comment', async () => {
    // Get sample comment
    const testComment = await Comments.findOne();

    // Make a PUT request to like the comment
    const response = await request(app)
      .put('/comments/like')
      .send({ commentId: testComment._id, like: true })
      .set('Content-Type', 'application/json')

    // Assert that the response status code is 200 (OK)
    expect(response.status).toBe(200);

    // Assert that the response message indicates that the comment was liked
    expect(response.body.message).toBe('Comment liked successfully');

    // Assert that the comment's like count has increased by 1
    const updatedComment = await Comments.findById(testComment._id);
    expect(updatedComment.like).toBe(1);
  });

  it('should successfully unlike a comment', async () => {
    // Get sample comment
    const testComment = await Comments.findOne();

    // Make a PUT request to like the comment
    const response = await request(app)
      .put('/comments/like')
      .send({ commentId: testComment._id, like: false })
      .set('Content-Type', 'application/json')

    // Assert that the response status code is 200 (OK)
    expect(response.status).toBe(200);

    // Assert that the response message indicates that the comment was unliked
    expect(response.body.message).toBe('Comment unliked successfully');

    // Assert that the comment's like count has increased by 1
    const updatedComment = await Comments.findById(testComment._id);
    expect(updatedComment.like).toBe(0);
  });
});

