import express from 'express';
import Investment from '../models/Investment.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get all investments
router.get('/', async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id })
      .sort({ purchaseDate: -1 })
      .select('-__v');
    res.json({ count: investments.length, investments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create investment
router.post('/', async (req, res) => {
  try {
    const { name, type, amount, currentValue, purchaseDate, description } = req.body;

    if (!name || !type || !amount) {
      return res.status(400).json({ message: 'Please provide name, type, and amount' });
    }

    const investment = await Investment.create({
      userId: req.user._id,
      name,
      type,
      amount,
      currentValue: currentValue || amount,
      purchaseDate: purchaseDate || new Date(),
      description: description || '',
      status: 'active',
    });

    res.status(201).json({ message: 'Investment created successfully', investment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update investment
router.put('/:id', async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    if (investment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(investment, req.body);
    await investment.save();

    res.json({ message: 'Investment updated successfully', investment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete investment
router.delete('/:id', async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    if (investment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Investment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

