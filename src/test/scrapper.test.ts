import App from '@/app';
import type { IndeedSearch } from '@/interfaces/indeed';
import { redisClient } from '@/libs/queueProcess';
import type http from 'http';
import request from 'supertest';

const app = new App();
const startServer = (): Promise<http.Server> => {
  return new Promise((resolve, reject) => {
    try {
      const server = app.listen();
      server.on('listening', () => resolve(server));
      server.on('error', (error: Error) => reject(error));
    } catch (error) {
      reject(error);
    }
  });
};

let server: http.Server;

beforeAll(async () => {
  server = await startServer();
});

afterAll(async () => {
  await server.close();
  await redisClient.quit();
});

const generateMockValues = (count: number): IndeedSearch[] => {
  return Array.from({ length: count }, () => ({
    jobName: 'développeur web',
    salary: 18,
    contract: 'CDI',
    nightWork: false,
    graduation: [],
  }));
};

describe('API Scraping Route', () => {
  it('should add multiple jobs to the queue and process them', async () => {
    const mockValues = generateMockValues(7);

    const promises = mockValues.map(values =>
      request(server)
        .post('/api/scrapper/findJobs')
        .send({ websites: ['example'], values: [values] }),
    );

    const responses = await Promise.all(promises);

    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.htmlPage).toBeDefined();
    });
  });
});
