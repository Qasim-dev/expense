import express from 'express';
import Expense from '../models/Expense.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/expenses
// @desc    Get all expenses for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id })
      .sort({ date: -1 })
      .select('-__v');

    res.json({
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/expenses
// @desc    Create new expense
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    // Validation
    if (!title || amount === undefined || !category) {
      return res.status(400).json({ message: 'Please provide title, amount, and category' });
    }

    if (amount < 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      title,
      amount,
      category,
      date: date ? new Date(date) : new Date(),
      description: description || '',
    });

    res.status(201).json({
      message: 'Expense created successfully',
      expense,
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    // Find expense and verify ownership
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if expense belongs to user
    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this expense' });
    }

    // Update fields
    if (title !== undefined) expense.title = title;
    if (amount !== undefined) {
      if (amount < 0) {
        return res.status(400).json({ message: 'Amount must be positive' });
      }
      expense.amount = amount;
    }
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = new Date(date);
    if (description !== undefined) expense.description = description;

    await expense.save();

    res.json({
      message: 'Expense updated successfully',
      expense,
    });
  } catch (error) {
    console.error('Update expense error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid expense ID' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    // Find expense and verify ownership
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if expense belongs to user
    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid expense ID' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

