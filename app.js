'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import connectDatabase from './config/dbConnection.js';
import routes from './routes/index.js';

const app = express();
const port = process.env.PORT || 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Use middleware to parse JSON requests
app.use(bodyParser.json());

// Use your defined routes
app.use('/', routes);

// Connect to the database and start the server
connectDatabase()
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Express server started. Listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

export default app;
