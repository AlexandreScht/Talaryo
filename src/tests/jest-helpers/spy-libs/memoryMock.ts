// memoryCacheMock.ts
import { MemoryCacheJest } from '@/interfaces/jest';
import MemoryServerCache from '@libs/memoryCache';
import RedisInstanceMocked from './redisMock';

export default function memoryCacheMocked(): MemoryCacheJest {
  RedisInstanceMocked();
  const MemoryClassInstance = MemoryServerCache.getInstance();
  const setMemory = jest.spyOn(MemoryClassInstance, 'setMemory');
  const getMemory = jest.spyOn(MemoryClassInstance, 'getMemory');
  const addMemory = jest.spyOn(MemoryClassInstance, 'addMemory');
  const clearMemory = jest.spyOn(MemoryClassInstance, 'clearMemory');
  const delMemory = jest.spyOn(MemoryClassInstance, 'delMemory');

  return {
    setMemory,
    getMemory,
    addMemory,
    clearMemory,
    delMemory,
    memoryData: MemoryClassInstance.memory,
  };
}
