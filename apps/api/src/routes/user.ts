import express, { Router } from 'express';
import User, { IUser } from '../models/user';
import auth from '../middleware/auth';

const router: Router = express.Router();

interface UpdateUserRequestBody {
  name?: string;
  email?: string;
  password?: string;
}

// User signup
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

// User login
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
    res.send({ user, token });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send({ error: error.message });
    } else {
      res.status(400).send({ error: 'An unknown error occurred' });
    }
  }
});

// User logout (current session)
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
  } catch (error) {
    res.status(500).send({ error: 'Logout failed' });
  }
});

// Get user profile
router.get('/me', auth, async (req, res) => {
  res.send(req.user);
});

// Update user profile
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

// Delete user account
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
