/**
 * Storage Adapters
 *
 * Provides a consistent interface for key-value storage, abstracting
 * away the underlying implementation (e.g., localStorage, in-memory).
 */

/**
 * Base class for storage adapters
 */
class StorageAdapter {
  getItem(key) {
    throw new Error('Not implemented');
  }

  setItem(key, value) {
    throw new Error('Not implemented');
  }

  removeItem(key) {
    throw new Error('Not implemented');
  }

  getLogs(key) {
    try {
      const logs = this.getItem(key) || '[]';
      return JSON.parse(logs);
    } catch (error) {
      console.error('Failed to retrieve logs:', error);
      return [];
    }
  }

  saveLogs(key, logs, maxLogs = 100) {
    try {
      if (logs.length > maxLogs) {
        logs.splice(0, logs.length - maxLogs);
      }
      this.setItem(key, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save logs:', error);
    }
  }
}

/**
 * localStorage adapter (for browser environments)
 */
export class LocalStorageAdapter extends StorageAdapter {
  getItem(key) {
    return localStorage.getItem(key);
  }

  setItem(key, value) {
    localStorage.setItem(key, value);
  }

  removeItem(key) {
    localStorage.removeItem(key);
  }
}

/**
 * In-memory storage adapter (for testing or non-browser environments)
 */
export class InMemoryStorageAdapter extends StorageAdapter {
  constructor() {
    super();
    this.storage = new Map();
  }

  getItem(key) {
    return this.storage.get(key) || null;
  }

  setItem(key, value) {
    this.storage.set(key, value);
  }

  removeItem(key) {
    this.storage.delete(key);
  }
}