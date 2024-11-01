import { SocketManagerJest } from '@/interfaces/jest';
import type { eventData, socketPropsList } from '@interfaces/webSocket';
import SocketManager from '@libs/socketManager';
import RedisInstanceMocked from './redisMock';

class mockSocketManager {
  private static instance: mockSocketManager;
  public socketUserList = new Map<string, socketPropsList>();
  public socketEmitted: eventData[] = [];
  public socketEventInQueue: { idUser: string | number; eventData: eventData }[] = [];

  private constructor() {}
  public static getInstance(): mockSocketManager {
    if (!mockSocketManager.instance) {
      mockSocketManager.instance = new mockSocketManager();
    }
    return mockSocketManager.instance;
  }

  public ioSendTo(idUser: string | number, eventData: eventData) {
    if (this.socketUserList.has(String(idUser))) {
      const { eventName, ...res } = eventData;
      this.socketEmitted.push({
        eventName,
        ...res,
      });
    } else {
      this.socketEventInQueue.push({ idUser, eventData });
    }
  }
}

export default function SocketManagerMocked(): SocketManagerJest {
  RedisInstanceMocked();
  const mockSocketInstanceMock = mockSocketManager.getInstance();
  jest.spyOn(SocketManager, 'getInstance').mockImplementation(() => mockSocketInstanceMock as unknown as SocketManager);

  const ioSendTo = jest.spyOn(mockSocketInstanceMock, 'ioSendTo');

  mockSocketInstanceMock.socketUserList.clear();
  const socketUserList = mockSocketInstanceMock.socketUserList;
  const socketEmitted = (mockSocketInstanceMock.socketEmitted = []);
  const socketEventInQueue = (mockSocketInstanceMock.socketEventInQueue = []);
  return {
    ioSendTo,
    socketUserList,
    socketEmitted,
    socketEventInQueue,
  };
}
