import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchGoals = createAsyncThunk('goals/fetchGoals', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/goals`);
    return response.data.goals;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch goals');
  }
});

export const createGoal = createAsyncThunk('goals/createGoal', async (goalData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/goals`, goalData);
    return response.data.goal;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create goal');
  }
});

export const updateGoal = createAsyncThunk('goals/updateGoal', async ({ id, goalData }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${API_URL}/goals/${id}`, goalData);
    return response.data.goal;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update goal');
  }
});

export const deleteGoal = createAsyncThunk('goals/deleteGoal', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/goals/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete goal');
  }
});

const goalSlice = createSlice({
  name: 'goals',
  initialState: {
    goals: [],
    loading: false,
    error: null,
    showForm: false,
    editingGoal: null,
  },
  reducers: {
    setShowForm: (state, action) => {
      state.showForm = action.payload;
    },
    setEditingGoal: (state, action) => {
      state.editingGoal = action.payload;
      state.showForm = action.payload ? true : false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetForm: (state) => {
      state.showForm = false;
      state.editingGoal = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.unshift(action.payload);
        state.showForm = false;
        state.editingGoal = null;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex((goal) => goal._id === action.payload._id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
        state.showForm = false;
        state.editingGoal = null;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter((goal) => goal._id !== action.payload);
      });
  },
});

export const { setShowForm, setEditingGoal, clearError, resetForm } = goalSlice.actions;
export default goalSlice.reducer;

