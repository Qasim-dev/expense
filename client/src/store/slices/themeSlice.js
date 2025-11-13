import { createSlice } from '@reduxjs/toolkit';

const getInitialMode = () => {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem('expense-theme') || 'light';
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: getInitialMode(),
  },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('expense-theme', state.mode);
      }
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('expense-theme', state.mode);
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
