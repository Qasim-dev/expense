import express from 'express';
import Income from '../models/Income.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/income -> list income entries
router.get('/', async (req, res) => {
  try {
    const income = await Income.find({ userId: req.user._id }).sort({ date: -1 }).select('-__v');
    res.json({
      count: income.length,
      income,
    });
  } catch (error) {
    console.error('Get income error:', error);
    res.status(500).json({ message: 'Unable to fetch income', error: error.message });
  }
});

// POST /api/income -> create income
router.post('/', async (req, res) => {
  try {
    const { title, amount, source, date, notes, mode } = req.body;

    if (!title || amount === undefined) {
      return res.status(400).json({ message: 'Please provide title and amount' });
    }
    if (Number(amount) < 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    const income = await Income.create({
      userId: req.user._id,
      title,
      amount,
      source: source || 'General',
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
      mode,
    });

    res.status(201).json({
      message: 'Income logged successfully',
      income,
    });
  } catch (error) {
    console.error('Create income error:', error);
    res.status(500).json({ message: 'Unable to create income', error: error.message });
  }
});

// PUT /api/income/:id -> update income
router.put('/:id', async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ message: 'Income entry not found' });
    }
    if (income.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this income entry' });
    }

    const { title, amount, source, date, notes, mode } = req.body;
    if (title !== undefined) income.title = title;
    if (amount !== undefined) {
      if (Number(amount) < 0) {
        return res.status(400).json({ message: 'Amount must be positive' });
      }
      income.amount = amount;
    }
    if (source !== undefined) income.source = source;
    if (date !== undefined) income.date = new Date(date);
    if (notes !== undefined) income.notes = notes;
    if (mode !== undefined) income.mode = mode;

    await income.save();

    res.json({
      message: 'Income updated successfully',
      income,
    });
  } catch (error) {
    console.error('Update income error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid income ID' });
    }
    res.status(500).json({ message: 'Unable to update income', error: error.message });
  }
});

// DELETE /api/income/:id -> delete income
router.delete('/:id', async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ message: 'Income entry not found' });
    }
    if (income.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this income entry' });
    }

    await Income.findByIdAndDelete(req.params.id);
    res.json({ message: 'Income entry deleted successfully' });
  } catch (error) {
    console.error('Delete income error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid income ID' });
    }
    res.status(500).json({ message: 'Unable to delete income entry', error: error.message });
  }
});

export default router;
