import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user';
import taskRouter from './routes/task';
import connectDB from './db/mongoose';
import dotenv from 'dotenv';
// import taskRouter from './routes/task';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:4200',
    credentials: true,
  })
);
app.use(express.json());

const apiRouter = express.Router();

// Routes
apiRouter.use('/users', userRouter);
apiRouter.use('/tasks', taskRouter);

app.use('/api', apiRouter);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
