import express, { Router } from 'express';
import Task from '../models/task';
import auth from '../middleware/auth';
import { getWebSocketService } from '../websocket/websocket.adapter';

const router: Router = express.Router();

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - owner
 *             properties:
 *               title:
 *                 type: string
 *                 example: Task title
 *               description:
 *                 type: string
 *                 example: Task description
 *               completed:
 *                 type: boolean
 *                 example: false
 *               owner:
 *                 type: string
 *                 example: "5f6d6a8d8e9d5a0e0a0d0c0b0a090807060504030201000"
 *     responses:
 *       201:
 *         description: Successfully created a new task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post('/', auth, async (req, res) => {
  try {
    const wsService = getWebSocketService();
    const task = new Task({
      ...req.body,
      owner: req.user._id,
    });

    await task.save();
    wsService.sendToUser(req.user._id.toString(), 'notification', {
      message: `Added New Task: ${req.body.title}`,
      timestamp: new Date(),
    });
    res.status(201).send(task);
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
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     parameters:
 *       - name: completed
 *         in: query
 *         description: Filter tasks by completed status
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *     responses:
 *       200:
 *         description: Successfully retrieved all tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       500:
 *         description: Server error
 */
router.get('/', auth, async (req, res) => {
  const match = { completed: false };

  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }

  try {
    const tasks = await Task.find({ owner: req.user._id });
    // const tasks = await Task.find({ owner: req.user._id, ...match });
    res.send(tasks);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).send({ error: error.message });
    } else {
      res.status(500).send({ error: 'An unknown error occurred' });
    }
  }
});

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a specific task
 *     tags: [Tasks]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the task to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send({ error: 'Task not found' });
    }

    res.send(task);
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
 * /tasks/{id}:
 *   patch:
 *     summary: Update a specific task
 *     tags: [Tasks]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the task to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - completed
 *             properties:
 *               title:
 *                 type: string
 *                 example: Task title
 *               description:
 *                 type: string
 *                 example: Task description
 *               completed:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Successfully updated the task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', auth, async (req, res) => {
  const wsService = getWebSocketService();
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'description', 'completed'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const task: any = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send({ error: 'Task not found' });
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    wsService.sendToUser(req.user._id.toString(), 'notification', {
      message: `Updated Task: ${updates.join(', ')}`,
      timestamp: new Date(),
    });

    res.send(task);
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
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a specific task
 *     tags: [Tasks]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the task to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send({ error: 'Task not found' });
    }

    const wsService = getWebSocketService();
    wsService.sendToUser(req.user._id.toString(), 'notification', {
      message: `Deleted Task: ${task.title}`,
      timestamp: new Date(),
    });

    res.send(task);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).send({ error: error.message });
    } else {
      res.status(400).send({ error: 'An unknown error occurred' });
    }
  }
});

export default router;
