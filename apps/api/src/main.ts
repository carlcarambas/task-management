import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user';
import taskRouter from './routes/task';
import connectDB from './db/mongoose';
import dotenv from 'dotenv';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import http from 'http';
import createHttpError from 'http-errors';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Task manager API endpoints',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3333}/api`,
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '67fa50a98e9db5f455ed086b',
            },
            name: {
              type: 'string',
              example: 'Babababa Yaga',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'bbbb@mail.com',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-04-12T11:38:17.643Z',
            },
            __v: {
              type: 'number',
              example: 2,
            },
            id: {
              type: 'string',
              example: '67fa50a98e9db5f455ed086b',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '67fa50a98e9db5f455ed086b',
            },
            title: {
              type: 'string',
              example: 'Task title',
            },
            description: {
              type: 'string',
              example: 'Task description',
            },
            completed: {
              type: 'boolean',
              example: false,
            },
            owner: {
              type: 'string',
              example: '5f6d6a8d8e9d5a0e0a0d0c0b0a090807060504030201000',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-04-12T11:38:17.643Z',
            },
            __v: {
              type: 'number',
              example: 2,
            },
            id: {
              type: 'string',
              example: '67fa50a98e9db5f455ed086b',
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // apis: ['./src/routes/*.ts', './dist/routes/*.js'],
  apis: [
    './apps/api/src/routes/*.ts',
    './dist/apps/api/main.js', // Compiled entry point
    './dist/apps/api/src/routes/*.js', // Compiled routes
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:4200',
    credentials: true,
  })
);
app.use(express.json());

const apiRouter = express.Router();

// Swagger UI
apiRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/swagger.json', (_req, res) => {
  console.log('Looking for docs in:', `${__dirname}/routes/*.ts`);
  res.json(swaggerSpec);
});

// Routes
apiRouter.use('/users', userRouter);
apiRouter.use('/tasks', taskRouter);

app.use('/api', apiRouter);

// handle errors
// Catch 404 and forward to error handler
app.use((_req, _res, next) => {
  next(createHttpError(404, 'Endpoint not found'));
});

// Centralized error handler
app.use((err: any, req: Request, res: Response) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
  console.error(err.stack);

  res.status(err.status || 500).json({
    statusCode: err.status || 500,
    message: err.message,
    error: http.STATUS_CODES[err.status] || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3333;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});
