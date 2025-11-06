import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchBills = createAsyncThunk('bills/fetchBills', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/bills`);
    return response.data.bills;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch bills');
  }
});

export const createBill = createAsyncThunk('bills/createBill', async (billData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/bills`, billData);
    return response.data.bill;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create bill');
  }
});

export const updateBill = createAsyncThunk('bills/updateBill', async ({ id, billData }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${API_URL}/bills/${id}`, billData);
    return response.data.bill;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update bill');
  }
});

export const deleteBill = createAsyncThunk('bills/deleteBill', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/bills/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete bill');
  }
});

const billSlice = createSlice({
  name: 'bills',
  initialState: {
    bills: [],
    loading: false,
    error: null,
    showForm: false,
    editingBill: null,
  },
  reducers: {
    setShowForm: (state, action) => {
      state.showForm = action.payload;
    },
    setEditingBill: (state, action) => {
      state.editingBill = action.payload;
      state.showForm = action.payload ? true : false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetForm: (state) => {
      state.showForm = false;
      state.editingBill = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.bills.unshift(action.payload);
        state.showForm = false;
        state.editingBill = null;
      })
      .addCase(updateBill.fulfilled, (state, action) => {
        const index = state.bills.findIndex((bill) => bill._id === action.payload._id);
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
        state.showForm = false;
        state.editingBill = null;
      })
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.bills = state.bills.filter((bill) => bill._id !== action.payload);
      });
  },
});

export const { setShowForm, setEditingBill, clearError, resetForm } = billSlice.actions;
export default billSlice.reducer;

