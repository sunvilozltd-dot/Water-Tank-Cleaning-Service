/**
 * Robust IndexedDB Persistent Storage Utility
 * Provides virtually unlimited, rock-solid persistent storage across browser refreshes,
 * tab closures, and sessions. Solves localStorage 5MB quota errors.
 */

const DB_NAME = 'sunviloz_persistent_store_v1';
const DB_VERSION = 1;
const STORE_NAME = 'app_keyval';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not supported in this environment'));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('[IndexedDB] Failed to open database:', request.error);
        reject(request.error);
      };
    });
  }

  return dbPromise;
}

/**
 * Save value to IndexedDB
 */
export async function idbSet(key: string, value: string): Promise<boolean> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.warn('[IndexedDB] put error for key', key, req.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('[IndexedDB] idbSet failed:', err);
    return false;
  }
}

/**
 * Retrieve value from IndexedDB
 */
export async function idbGet(key: string): Promise<string | null> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result !== undefined ? req.result : null);
      };
      req.onerror = () => {
        console.warn('[IndexedDB] get error for key', key, req.error);
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Remove value from IndexedDB
 */
export async function idbDelete(key: string): Promise<boolean> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Save binary Blob/File to IndexedDB for large media (videos/large images)
 */
export async function idbSetBlob(key: string, blob: Blob | File): Promise<boolean> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.warn('[IndexedDB] put error for blob', key, req.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('[IndexedDB] idbSetBlob failed:', err);
    return false;
  }
}

/**
 * Retrieve binary Blob/File from IndexedDB
 */
export async function idbGetBlob(key: string): Promise<Blob | null> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result instanceof Blob ? req.result : null);
      };
      req.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Synchronize important keys from IndexedDB back into localStorage and memory on startup.
 */
export async function hydrateFromIndexedDb(keys: string[]): Promise<void> {
  if (typeof window === 'undefined') return;

  for (const key of keys) {
    try {
      const val = await idbGet(key);
      if (val && !localStorage.getItem(key)) {
        try {
          localStorage.setItem(key, val);
        } catch {
          // If localStorage is full, val is still available in IndexedDB
        }
      }
    } catch {
      // Ignore
    }
  }
}

