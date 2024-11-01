// streamManagerMock.ts
import { StreamManagerJest } from '@/interfaces/jest';
import StreamManager from '@libs/streamManager';
import SocketManagerMocked from './socketMock';

SocketManagerMocked();

export default function streamManagerMocked(userId: number | string): StreamManagerJest {
  const getStreamUser = jest.spyOn(StreamManager.prototype as any, 'getStreamUser');
  const init = jest.spyOn(StreamManager.prototype as any, 'init');
  const newStream = jest.spyOn(StreamManager.prototype, 'newStream');
  const checkStream = jest.spyOn(StreamManager.prototype as any, 'checkStream');
  const process = jest.spyOn(StreamManager.prototype as any, 'process');
  const execute = jest.spyOn(StreamManager.prototype as any, 'execute');
  const streamStrategies = jest.spyOn(StreamManager.prototype as any, 'streamStrategies');

  new StreamManager(userId);

  return {
    getStreamUser,
    init,
    newStream,
    checkStream,
    process,
    execute,
    streamStrategies,
  } as StreamManagerJest;
}
