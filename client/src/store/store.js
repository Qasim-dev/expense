import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import expenseReducer from './slices/expenseSlice';
import billReducer from './slices/billSlice';
import goalReducer from './slices/goalSlice';
import investmentReducer from './slices/investmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expenseReducer,
    bills: billReducer,
    goals: goalReducer,
    investments: investmentReducer,
  },
});

