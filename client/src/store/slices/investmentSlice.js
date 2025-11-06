import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchInvestments = createAsyncThunk('investments/fetchInvestments', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/investments`);
    return response.data.investments;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch investments');
  }
});

export const createInvestment = createAsyncThunk('investments/createInvestment', async (investmentData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/investments`, investmentData);
    return response.data.investment;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create investment');
  }
});

export const updateInvestment = createAsyncThunk('investments/updateInvestment', async ({ id, investmentData }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${API_URL}/investments/${id}`, investmentData);
    return response.data.investment;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update investment');
  }
});

export const deleteInvestment = createAsyncThunk('investments/deleteInvestment', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/investments/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete investment');
  }
});

const investmentSlice = createSlice({
  name: 'investments',
  initialState: {
    investments: [],
    loading: false,
    error: null,
    showForm: false,
    editingInvestment: null,
  },
  reducers: {
    setShowForm: (state, action) => {
      state.showForm = action.payload;
    },
    setEditingInvestment: (state, action) => {
      state.editingInvestment = action.payload;
      state.showForm = action.payload ? true : false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetForm: (state) => {
      state.showForm = false;
      state.editingInvestment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestments.fulfilled, (state, action) => {
        state.loading = false;
        state.investments = action.payload;
      })
      .addCase(fetchInvestments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createInvestment.fulfilled, (state, action) => {
        state.investments.unshift(action.payload);
        state.showForm = false;
        state.editingInvestment = null;
      })
      .addCase(updateInvestment.fulfilled, (state, action) => {
        const index = state.investments.findIndex((inv) => inv._id === action.payload._id);
        if (index !== -1) {
          state.investments[index] = action.payload;
        }
        state.showForm = false;
        state.editingInvestment = null;
      })
      .addCase(deleteInvestment.fulfilled, (state, action) => {
        state.investments = state.investments.filter((inv) => inv._id !== action.payload);
      });
  },
});

export const { setShowForm, setEditingInvestment, clearError, resetForm } = investmentSlice.actions;
export default investmentSlice.reducer;

