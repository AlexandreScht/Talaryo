import { App } from '@/app';
import { AuthRegister } from '@interfaces/auth';
import { ApiRouter } from '@routes/prepareRoutes';
import request from 'supertest';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Auth', () => {
  describe('[POST] /register', () => {
    it('response should have true', () => {
      const userData: AuthRegister = {
        email: 'test@gmail.com',
        password: 'Default08!',
        token: 'disabledToken',
      };
      const app = new App(new ApiRouter());
      return request(app.getServer()).post('/api/register').send(userData).expect(201);
    });
  });

  describe('[POST] /login', () => {
    it('response should have true', () => {
      const userData: AuthRegister = {
        email: 'test@gmail.com',
        password: 'Default08!',
        token: 'disabledToken',
      };
      const app = new App(new ApiRouter());
      return request(app.getServer()).post('/api/login').send(userData).expect(200);
    });
  });
});
