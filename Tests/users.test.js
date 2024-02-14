import supertest from 'supertest';

import app from '../app.js';
import { expect } from '@jest/globals';

const request = supertest(app);

describe('valid request return HTTP success', () => {
  it('should return success', async () => {
    const response = await request.get('/users').send({
      name: 'user1',
      password: 'password1',
    });

    expect(response.status).toBe(200);
  });
});

describe('invalid request return HTTP error', () => {
  it('should return 404', async () => {
    const response = await request.get('/users/1').send({});

    expect(response.status).toBe(404);
  });
});
