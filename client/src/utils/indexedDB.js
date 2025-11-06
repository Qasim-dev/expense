// IndexedDB utility for offline storage
const DB_NAME = 'ExpenseTrackerDB';
const DB_VERSION = 1;
const STORES = {
  EXPENSES: 'expenses',
  BILLS: 'bills',
  GOALS: 'goals',
  SYNC_QUEUE: 'syncQueue',
};

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Create expenses store
      if (!database.objectStoreNames.contains(STORES.EXPENSES)) {
        const expenseStore = database.createObjectStore(STORES.EXPENSES, {
          keyPath: '_id',
        });
        expenseStore.createIndex('userId', 'userId', { unique: false });
        expenseStore.createIndex('date', 'date', { unique: false });
      }

      // Create bills store
      if (!database.objectStoreNames.contains(STORES.BILLS)) {
        const billStore = database.createObjectStore(STORES.BILLS, {
          keyPath: '_id',
        });
        billStore.createIndex('userId', 'userId', { unique: false });
        billStore.createIndex('dueDate', 'dueDate', { unique: false });
      }

      // Create goals store
      if (!database.objectStoreNames.contains(STORES.GOALS)) {
        const goalStore = database.createObjectStore(STORES.GOALS, {
          keyPath: '_id',
        });
        goalStore.createIndex('userId', 'userId', { unique: false });
      }

      // Create sync queue store
      if (!database.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = database.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        syncStore.createIndex('type', 'type', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

export const getDB = () => {
  if (db) return Promise.resolve(db);
  return initDB();
};

// Expense operations
export const saveExpenseToDB = async (expense) => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.EXPENSES], 'readwrite');
    const store = transaction.objectStore(STORES.EXPENSES);
    const request = store.put(expense);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getExpensesFromDB = async (userId) => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.EXPENSES], 'readonly');
    const store = transaction.objectStore(STORES.EXPENSES);
    const index = store.index('userId');
    const request = index.getAll(userId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteExpenseFromDB = async (id) => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.EXPENSES], 'readwrite');
    const store = transaction.objectStore(STORES.EXPENSES);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Sync queue operations
export const addToSyncQueue = async (action) => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const syncItem = {
      type: action.type,
      payload: action.payload,
      timestamp: Date.now(),
    };
    const request = store.add(syncItem);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getSyncQueue = async () => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SYNC_QUEUE], 'readonly');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const clearSyncQueue = async () => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const removeFromSyncQueue = async (id) => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Check if online
export const isOnline = () => {
  return navigator.onLine;
};

// Network status listener
export const onOnline = (callback) => {
  window.addEventListener('online', callback);
};

export const onOffline = (callback) => {
  window.addEventListener('offline', callback);
};

