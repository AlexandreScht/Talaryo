'use client';

type StorageType = 'local' | 'session';

const createStorageManager = (type: StorageType) => {
  const haveAccess = typeof window !== 'undefined';

  const getStorage = (): Storage => {
    return type === 'local' ? window.localStorage : window.sessionStorage;
  };

  const setItem = <T>(name: string, value: T): void => {
    const storage = getStorage();
    try {
      storage.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set item in ${type}Storage:`, error);
    }
  };

  const getItem = <T>(name: string): T | null => {
    const storage = getStorage();
    try {
      const item = storage.getItem(name);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to get item from ${type}Storage:`, error);
      return null;
    }
  };

  const addItem = <T>(name: string, value: T): void => {
    try {
      const existing = getItem<T[]>(name);
      if (existing) {
        existing.push(value);
        setItem(name, existing);
      } else {
        setItem(name, [value]);
      }
    } catch (error) {
      console.error(`Failed to add item to ${type}Storage:`, error);
    }
  };

  return { setItem, getItem, addItem, haveAccess };
};

export const localStorageManager = createStorageManager('local');
export const sessionStorageManager = createStorageManager('session');
