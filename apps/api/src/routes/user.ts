import express, { Router } from 'express';
import User, { IUser } from '../models/user';
import auth from '../middleware/auth';

const router: Router = express.Router();

interface UpdateUserRequestBody {
  name?: string;
  email?: string;
  password?: string;
}

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Babababa Yaga
 *               email:
 *                 type: string
 *                 format: email
 *                 example: bbbb@mail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123!"
 *     responses:
 *       201:
 *         description: Successfully created a new user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: 'Email already in use' });
    }

    const user: IUser = new User({ name, email, password });
    await user.save();

    const token: string = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send({ error: error.message });
    } else {
      res.status(400).send({ error: 'An unknown error occurred' });
    }
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123!"
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user: IUser = await User.findByCredentials(email, password);
    const token: string = await user.generateAuthToken();

    // secure set to false to allow cross-site access for testing purposes
    // res.cookie('token', token, { maxAge: 60 * 60 * 24 * 30, httpOnly: false });
    res.cookie('token', token, {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: 'lax',
      secure: false /* true */,
    });
    // for simplification, we are returning the token as well
    res.send({ user, token });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send({ error: error.message });
    } else {
      res.status(400).send({ error: 'An unknown error occurred' });
    }
  }
});

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message indicating that the user has been logged out
 *                   example: "Logged out successfully"
 *       500:
 *         description: Server error  
 */
router.post('/logout', auth, async (req, res) => {
  try {
    const token = req.cookies.token;
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    const user = await User.findOne({ 'tokens.token': token });
    if (user) {
      user.tokens = user.tokens.filter((t) => t.token !== token);
      await user.save();
    }

    res.send({ message: 'Logged out successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).send({ error: 'Logout failed' });
    } else {
      res.status(500).send({ error: 'An unknown error occurred' });
    }
  }
});

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error  
 */
router.get('/me', auth, async (req, res) => {
  res.send(req.user);
});

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update the current user's profile
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Babababa Yaga
 *               email:
 *                 type: string
 *                 format: email
 *                 example: bbbb@mail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123!"
 *     responses:
 *       200:
 *         description: Successfully updated the user's profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error    
 */
router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach((update) => {
      (req.user as any)[update] =
        req.body[update as keyof UpdateUserRequestBody];
    });
    await req.user.save();

    res.send(req.user);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send({ error: error.message });
    } else {
      res.status(400).send({ error: 'An unknown error occurred' });
    }
  }
});

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete the current user's account
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successfully deleted the user's account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error  
 */
router.delete('/me', auth, async (req, res) => {
  try {
    await req.user.deleteOne();
    res.send(req.user);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).send({ error: error.message });
    } else {
      res.status(500).send({ error: 'An unknown error occurred' });
    }
  }
});

export default router;
