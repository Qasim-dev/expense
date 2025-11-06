import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Bill name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Subscription', 'Utility', 'Insurance', 'Loan', 'Other'],
      default: 'Other',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    frequency: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Yearly', 'One-time'],
      default: 'Monthly',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidDate: {
      type: Date,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

billSchema.index({ userId: 1, dueDate: 1 });

const Bill = mongoose.model('Bill', billSchema);

export default Bill;

