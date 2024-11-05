import { MemoryCacheJest, ScoresServicesJest, SocketManagerJest } from '@/interfaces/jest';
import memoryCacheMocked from '@/tests/jest-helpers/spy-libs/memoryMock';
import SocketManagerMocked from '@/tests/jest-helpers/spy-libs/socketMock';
import request from 'supertest';
import scoresMockedService from '../jest-helpers/spy-services/scores';

SocketManagerMocked();
describe('WEBHOOK signalHire', () => {
  const contacts = [{ type: 'email', value: 'alexandreschecht@gmail.com', rating: 25 }];
  const signalHireEvent = (empty: boolean) => {
    return request(global.app)
      .post('/api/webhook/signalHere')
      .set('request-id', 'requestId')
      .send([{ candidate: { ...(!empty ? {} : { contacts }) } }]);
  };

  //?socket
  let socketMocked: SocketManagerJest;

  //? service
  let improveScore: ScoresServicesJest['improveScore'];

  //? memoryCache
  let getMemory: MemoryCacheJest['getMemory'];
  let delMemory: MemoryCacheJest['delMemory'];

  beforeEach(() => {
    //? memory
    getMemory = memoryCacheMocked().getMemory;
    delMemory = memoryCacheMocked().delMemory;

    //? service
    improveScore = scoresMockedService().improveScore;

    //?socket
    socketMocked = SocketManagerMocked();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  //; contact founded
  it('contact founded => 200 status ( socket io event => contacts )', async () => {
    getMemory.mockReturnValue({ userId: 1, link: 'myLink' } as any);
    improveScore.mockResolvedValue(true as any);
    const response = await signalHireEvent(true);

    expect(response.status).toBe(200);
    expect(getMemory).toHaveBeenNthCalledWith(1, 'signalHire.requestId');
    expect(improveScore).toHaveBeenNthCalledWith(1, ['mails'], 1, 1);
    expect(socketMocked.ioSendTo).toHaveBeenNthCalledWith(1, 1, {
      eventName: 'SignalHireResponse',
      body: {
        contacts: contacts
          ?.map((data: { value: string; type: 'email' | 'phone'; rating: number }) => {
            if (data)
              return {
                type: data.type,
                value: data.value,
                rating: data.rating,
              };
          })
          .filter((v: any) => v),
        link: 'myLink',
      },
    });
    expect(delMemory).toHaveBeenNthCalledWith(1, 'signalHire.requestId');
  });

  //; no contact founded
  it('no contact founded => 200 status ( socket io event => empty )', async () => {
    getMemory.mockReturnValue({ userId: 1, link: 'myLink' } as any);
    const response = await signalHireEvent(false);

    expect(response.status).toBe(200);
    expect(getMemory).toHaveBeenNthCalledWith(1, 'signalHire.requestId');
    expect(improveScore).not.toHaveBeenCalled();
    expect(socketMocked.ioSendTo).toHaveBeenNthCalledWith(1, 1, {
      eventName: 'SignalHireResponse',
      body: {
        contacts: undefined,
        link: 'myLink',
      },
    });
    expect(delMemory).toHaveBeenNthCalledWith(1, 'signalHire.requestId');
  });
});
