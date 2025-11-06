import express from 'express';
import Bill from '../models/Bill.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get all bills
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.user._id })
      .sort({ dueDate: 1 })
      .select('-__v');
    res.json({ count: bills.length, bills });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create bill
router.post('/', async (req, res) => {
  try {
    const { name, category, amount, dueDate, frequency, description, icon } = req.body;

    if (!name || !amount || !dueDate) {
      return res.status(400).json({ message: 'Please provide name, amount, and due date' });
    }

    const bill = await Bill.create({
      userId: req.user._id,
      name,
      category: category || 'Other',
      amount,
      dueDate,
      frequency: frequency || 'Monthly',
      description: description || '',
      icon: icon || '',
    });

    res.status(201).json({ message: 'Bill created successfully', bill });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update bill
router.put('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(bill, req.body);
    await bill.save();

    res.json({ message: 'Bill updated successfully', bill });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete bill
router.delete('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

