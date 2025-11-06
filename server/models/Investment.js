import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Investment name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Investment type is required'],
      enum: ['Stocks', 'Mutual Funds', 'Fixed Deposit', 'Gold', 'Real Estate', 'Crypto', 'Other'],
      default: 'Other',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    currentValue: {
      type: Number,
      default: function() {
        return this.amount;
      },
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'matured'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

investmentSchema.index({ userId: 1, status: 1 });

const Investment = mongoose.model('Investment', investmentSchema);

export default Investment;

