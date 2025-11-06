import express from 'express';
import Goal from '../models/Goal.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get all goals
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json({ count: goals.length, goals });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create goal
router.post('/', async (req, res) => {
  try {
    const { title, description, targetAmount, targetDate, category } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({ message: 'Please provide title and target amount' });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      description: description || '',
      targetAmount,
      targetDate: targetDate || null,
      category: category || 'General',
      savedAmount: 0,
      status: 'active',
    });

    res.status(201).json({ message: 'Goal created successfully', goal });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update goal
router.put('/:id', async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(goal, req.body);
    await goal.save();

    res.json({ message: 'Goal updated successfully', goal });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete goal
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

