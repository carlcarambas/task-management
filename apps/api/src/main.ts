import express from 'express';
import cors from 'cors';
import userRouter from './routes/user';
import connectDB from './db/mongoose';
import dotenv from 'dotenv';
// import taskRouter from './routes/task';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRouter);
// app.use(taskRouter);
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
