import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  saveExpenseToDB,
  getExpensesFromDB,
  deleteExpenseFromDB,
  addToSyncQueue,
  isOnline,
} from '../../utils/indexedDB';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const setPendingSyncCount = createAction('expenses/setPendingSyncCount');
export const incrementPendingSync = createAction('expenses/incrementPendingSync');
export const decrementPendingSync = createAction('expenses/decrementPendingSync');

// Helper to get user ID from auth state
const getUserId = (getState) => {
  const user = getState().auth.user;
  return user?.id || user?._id;
};

const stampSyncTime = (state) => {
  if (state.isOnline) {
    state.lastSyncedAt = new Date().toISOString();
  }
};

// Async thunks with offline support
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (_, { rejectWithValue, getState }) => {
    const userId = getUserId(getState);
    
    try {
      if (isOnline()) {
        const response = await axios.get(`${API_URL}/expenses`);
        const expenses = response.data.expenses;
        
        // Save to IndexedDB
        if (userId) {
          for (const expense of expenses) {
            await saveExpenseToDB(expense);
          }
        }
        
        return expenses;
      } else {
        // Offline: fetch from IndexedDB
        if (userId) {
          const expenses = await getExpensesFromDB(userId);
          return expenses;
        }
        return [];
      }
    } catch (error) {
      // If online request fails, try IndexedDB
      if (userId) {
        try {
          const expenses = await getExpensesFromDB(userId);
          return expenses;
        } catch (dbError) {
          return rejectWithValue(error.response?.data?.message || 'Failed to fetch expenses');
        }
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expenses');
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData, { rejectWithValue, getState, dispatch }) => {
    const userId = getUserId(getState);
    
    try {
      if (isOnline()) {
        const response = await axios.post(`${API_URL}/expenses`, expenseData);
        const expense = response.data.expense;
        
        // Save to IndexedDB
        if (userId) {
          await saveExpenseToDB(expense);
        }
        
        return expense;
      } else {
        // Offline: create temporary expense and add to sync queue
        const tempExpense = {
          ...expenseData,
          _id: `temp_${Date.now()}`,
          userId: userId,
          createdAt: new Date().toISOString(),
          isOffline: true,
        };
        
        // Save to IndexedDB
        if (userId) {
          await saveExpenseToDB(tempExpense);
          await addToSyncQueue({
            type: 'CREATE_EXPENSE',
            payload: expenseData,
          });
          dispatch(incrementPendingSync());
        }
        
        return tempExpense;
      }
    } catch (error) {
      // If online request fails, create offline
      if (userId) {
        const tempExpense = {
          ...expenseData,
          _id: `temp_${Date.now()}`,
          userId: userId,
          createdAt: new Date().toISOString(),
          isOffline: true,
        };
        
        await saveExpenseToDB(tempExpense);
        await addToSyncQueue({
          type: 'CREATE_EXPENSE',
          payload: expenseData,
        });
        dispatch(incrementPendingSync());
        
        return tempExpense;
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to create expense');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, expenseData }, { rejectWithValue, getState, dispatch }) => {
    const userId = getUserId(getState);
    
    try {
      if (isOnline()) {
        const response = await axios.put(`${API_URL}/expenses/${id}`, expenseData);
        const expense = response.data.expense;
        
        // Update IndexedDB
        if (userId) {
          await saveExpenseToDB(expense);
        }
        
        return expense;
      } else {
        // Offline: update in IndexedDB and add to sync queue
        const updatedExpense = {
          ...expenseData,
          _id: id,
          userId: userId,
          updatedAt: new Date().toISOString(),
          isOffline: true,
        };
        
        if (userId) {
          await saveExpenseToDB(updatedExpense);
          await addToSyncQueue({
            type: 'UPDATE_EXPENSE',
            payload: { id, expenseData },
          });
          dispatch(incrementPendingSync());
        }
        
        return updatedExpense;
      }
    } catch (error) {
      // If online request fails, update offline
      if (userId) {
        const updatedExpense = {
          ...expenseData,
          _id: id,
          userId: userId,
          updatedAt: new Date().toISOString(),
          isOffline: true,
        };
        
        await saveExpenseToDB(updatedExpense);
        await addToSyncQueue({
          type: 'UPDATE_EXPENSE',
          payload: { id, expenseData },
        });
        dispatch(incrementPendingSync());
        
        return updatedExpense;
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to update expense');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id, { rejectWithValue, getState, dispatch }) => {
    const userId = getUserId(getState);
    
    try {
      if (isOnline()) {
        await axios.delete(`${API_URL}/expenses/${id}`);
        
        // Delete from IndexedDB
        if (userId) {
          await deleteExpenseFromDB(id);
        }
        
        return id;
      } else {
        // Offline: delete from IndexedDB and add to sync queue
        if (userId) {
          await deleteExpenseFromDB(id);
          await addToSyncQueue({
            type: 'DELETE_EXPENSE',
            payload: { id },
          });
          dispatch(incrementPendingSync());
        }
        
        return id;
      }
    } catch (error) {
      // If online request fails, delete offline
      if (userId) {
        await deleteExpenseFromDB(id);
        await addToSyncQueue({
          type: 'DELETE_EXPENSE',
          payload: { id },
        });
        dispatch(incrementPendingSync());
        return id;
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to delete expense');
    }
  }
);

// Sync offline changes when coming back online
export const syncOfflineChanges = createAsyncThunk(
  'expenses/syncOfflineChanges',
  async (_, { dispatch }) => {
    const { getSyncQueue, removeFromSyncQueue } = await import('../../utils/indexedDB');
    const queue = await getSyncQueue();
    dispatch(setPendingSyncCount(queue.length));

    let incomeActionsModule = null;
    const ensureIncomeActions = async () => {
      if (!incomeActionsModule) {
        incomeActionsModule = await import('./incomeSlice');
      }
      return incomeActionsModule;
    };
    
    for (const item of queue) {
      try {
        if (item.type === 'CREATE_EXPENSE') {
          await dispatch(createExpense(item.payload));
        } else if (item.type === 'UPDATE_EXPENSE') {
          await dispatch(updateExpense(item.payload));
        } else if (item.type === 'DELETE_EXPENSE') {
          await dispatch(deleteExpense(item.payload.id));
        } else if (item.type === 'CREATE_INCOME') {
          const { createIncome } = await ensureIncomeActions();
          await dispatch(createIncome(item.payload));
        } else if (item.type === 'UPDATE_INCOME') {
          const { updateIncome } = await ensureIncomeActions();
          await dispatch(updateIncome(item.payload));
        } else if (item.type === 'DELETE_INCOME') {
          const { deleteIncome } = await ensureIncomeActions();
          await dispatch(deleteIncome(item.payload.id));
        }
        await removeFromSyncQueue(item.id);
        dispatch(decrementPendingSync());
      } catch (error) {
        console.error('Failed to sync item:', error);
      }
    }
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState: {
    expenses: [],
    loading: false,
    error: null,
    showForm: false,
    editingExpense: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingSyncCount: 0,
    lastSyncedAt: null,
  },
  reducers: {
    setShowForm: (state, action) => {
      state.showForm = action.payload;
    },
    setEditingExpense: (state, action) => {
      state.editingExpense = action.payload;
      state.showForm = action.payload ? true : false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetForm: (state) => {
      state.showForm = false;
      state.editingExpense = null;
    },
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setPendingSyncCount, (state, action) => {
        state.pendingSyncCount = Math.max(0, action.payload || 0);
      })
      .addCase(incrementPendingSync, (state) => {
        state.pendingSyncCount += 1;
      })
      .addCase(decrementPendingSync, (state) => {
        state.pendingSyncCount = Math.max(0, state.pendingSyncCount - 1);
      })
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
        state.error = null;
        stampSyncTime(state);
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create expense
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        // Remove temp expense if exists and add new one
        state.expenses = state.expenses.filter(
          (exp) => exp._id !== action.payload._id || !exp.isOffline
        );
        state.expenses.unshift(action.payload);
        state.showForm = false;
        state.editingExpense = null;
        state.error = null;
        stampSyncTime(state);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update expense
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.expenses.findIndex(
          (expense) => expense._id === action.payload._id
        );
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        state.showForm = false;
        state.editingExpense = null;
        state.error = null;
        stampSyncTime(state);
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete expense
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = state.expenses.filter(
          (expense) => expense._id !== action.payload
        );
        state.error = null;
        stampSyncTime(state);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setShowForm, setEditingExpense, clearError, resetForm, setOnlineStatus } = expenseSlice.actions;
export default expenseSlice.reducer;
