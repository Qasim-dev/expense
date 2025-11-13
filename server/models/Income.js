import mongoose from 'mongoose';

const IncomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    source: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      default: 'General',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: () => new Date(),
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    mode: {
      type: String,
      trim: true,
      maxlength: 60,
    },
  },
  {
    timestamps: true,
  }
);

IncomeSchema.index({ userId: 1, date: -1 });

const Income = mongoose.model('Income', IncomeSchema);

export default Income;
