import express from 'express';
import routes from './src/routes.js';
import dotenv from 'dotenv';
import cors from 'cors';

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Define routes
app.use('/api', routes);

// Define a root route
app.get('/', (req, res) => {
  res.send('Welcome to the weather app');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
