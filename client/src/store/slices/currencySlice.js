import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'expense_tracker_currency';

const defaultOptions = [
  { code: 'PKR', symbol: 'Rs', label: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
];

const getSavedCurrency = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to read currency from storage', error);
    return null;
  }
};

const saveCurrency = (value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch (error) {
    console.warn('Unable to persist currency selection', error);
  }
};

const initialState = {
  selected: getSavedCurrency() || 'PKR',
  options: defaultOptions,
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      if (!action.payload || state.selected === action.payload) {
        return;
      }
      state.selected = action.payload;
      saveCurrency(action.payload);
    },
    hydrateCurrency: (state, action) => {
      if (action.payload) {
        state.selected = action.payload;
      }
    },
  },
});

export const { setCurrency, hydrateCurrency } = currencySlice.actions;
export default currencySlice.reducer;
