import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  saveIncomeToDB,
  getIncomeFromDB,
  deleteIncomeFromDB,
  addToSyncQueue,
  isOnline,
} from "../../utils/indexedDB";
import { incrementPendingSync } from "./expenseSlice";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getUserId = (getState) => {
  const user = getState().auth.user;
  return user?.id || user?._id;
};

const stampSyncTime = (state) => {
  if (state.isOnline) {
    state.lastSyncedAt = new Date().toISOString();
  }
};

export const fetchIncome = createAsyncThunk(
  "income/fetchIncome",
  async (_, { rejectWithValue, getState }) => {
    const userId = getUserId(getState);
    try {
      if (isOnline()) {
        const response = await axios.get(`${API_URL}/income`);

        const records = response.data.income || response.data.records || [];
        return records;
      }

      if (userId) {
        return await getIncomeFromDB(userId);
      }

      if (userId && response.data.income) {
        for (const entry of response.data.income) {
          await saveIncomeToDB(entry);
        }
      }
      return [];
    } catch (error) {
      if (userId) {
        try {
          return await getIncomeFromDB(userId);
        } catch (dbError) {
          return rejectWithValue(
            error.response?.data?.message || "Failed to fetch income"
          );
        }
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch income"
      );
    }
  }
);

export const createIncome = createAsyncThunk(
  "income/createIncome",
  async (incomeData, { rejectWithValue, getState, dispatch }) => {
    const userId = getUserId(getState);
    try {
      if (isOnline()) {
        const response = await axios.post(`${API_URL}/income`, incomeData);
        const income = response.data.income;
        // if (userId) {
        //   await saveIncomeToDB(income);
        // }
        return income;
      }

      const tempIncome = {
        ...incomeData,
        _id: `temp_income_${Date.now()}`,
        userId,
        createdAt: new Date().toISOString(),
        isOffline: true,
      };
      if (userId) {
        await saveIncomeToDB(tempIncome);
        await addToSyncQueue({
          type: "CREATE_INCOME",
          payload: incomeData,
        });
        dispatch(incrementPendingSync());
      }
      return tempIncome;
    } catch (error) {
      if (userId) {
        const tempIncome = {
          ...incomeData,
          _id: `temp_income_${Date.now()}`,
          userId,
          createdAt: new Date().toISOString(),
          isOffline: true,
        };
        await saveIncomeToDB(tempIncome);
        await addToSyncQueue({
          type: "CREATE_INCOME",
          payload: incomeData,
        });
        dispatch(incrementPendingSync());
        return tempIncome;
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to create income"
      );
    }
  }
);

export const updateIncome = createAsyncThunk(
  "income/updateIncome",
  async ({ id, incomeData }, { rejectWithValue, getState, dispatch }) => {
    const userId = getUserId(getState);
    try {
      if (isOnline()) {
        const response = await axios.put(`${API_URL}/income/${id}`, incomeData);
        const income = response.data.income;
        // if (userId) {
        //   await saveIncomeToDB(income);
        // }
        return income;
      }

      const tempIncome = {
        ...incomeData,
        _id: id,
        userId,
        updatedAt: new Date().toISOString(),
        isOffline: true,
      };
      if (userId) {
        await saveIncomeToDB(tempIncome);
        await addToSyncQueue({
          type: "UPDATE_INCOME",
          payload: { id, incomeData },
        });
        dispatch(incrementPendingSync());
      }
      return tempIncome;
    } catch (error) {
      if (userId) {
        const tempIncome = {
          ...incomeData,
          _id: id,
          userId,
          updatedAt: new Date().toISOString(),
          isOffline: true,
        };
        await saveIncomeToDB(tempIncome);
        await addToSyncQueue({
          type: "UPDATE_INCOME",
          payload: { id, incomeData },
        });
        dispatch(incrementPendingSync());
        return tempIncome;
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to update income"
      );
    }
  }
);

export const deleteIncome = createAsyncThunk(
  "income/deleteIncome",
  async (id, { rejectWithValue, getState, dispatch }) => {
    const userId = getUserId(getState);
    try {
      if (isOnline()) {
        await axios.delete(`${API_URL}/income/${id}`);
        // if (userId) {
        //   await deleteIncomeFromDB(id);
        // }
        return id;
      }

      if (userId) {
        await deleteIncomeFromDB(id);
        await addToSyncQueue({
          type: "DELETE_INCOME",
          payload: { id },
        });
        dispatch(incrementPendingSync());
      }
      return id;
    } catch (error) {
      if (userId) {
        await deleteIncomeFromDB(id);
        await addToSyncQueue({
          type: "DELETE_INCOME",
          payload: { id },
        });
        dispatch(incrementPendingSync());
        return id;
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete income"
      );
    }
  }
);

const incomeSlice = createSlice({
  name: "income",
  initialState: {
    records: [],
    loading: false,
    error: null,
    showForm: false,
    editingIncome: null,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    lastSyncedAt: null,
  },
  reducers: {
    setIncomeFormVisible: (state, action) => {
      state.showForm = action.payload;
    },
    setEditingIncome: (state, action) => {
      state.editingIncome = action.payload;
      state.showForm = Boolean(action.payload);
    },
    clearIncomeError: (state) => {
      state.error = null;
    },
    resetIncomeForm: (state) => {
      state.showForm = false;
      state.editingIncome = null;
    },
    setIncomeOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncome.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
        state.error = null;
        stampSyncTime(state);
      })
      .addCase(fetchIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createIncome.fulfilled, (state, action) => {
        state.loading = false;
        state.records.unshift(action.payload);
        state.showForm = false;
        state.editingIncome = null;
        stampSyncTime(state);
      })
      .addCase(createIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIncome.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.records.findIndex(
          (income) => income._id === action.payload._id
        );
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        state.showForm = false;
        state.editingIncome = null;
        stampSyncTime(state);
      })
      .addCase(updateIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteIncome.fulfilled, (state, action) => {
        state.loading = false;
        state.records = state.records.filter(
          (income) => income._id !== action.payload
        );
        stampSyncTime(state);
      })
      .addCase(deleteIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setIncomeFormVisible,
  setEditingIncome,
  clearIncomeError,
  resetIncomeForm,
  setIncomeOnlineStatus,
} = incomeSlice.actions;
export default incomeSlice.reducer;
