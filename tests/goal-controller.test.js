// ./tests/goal-controller.test.js
// 작성자: Minjae Han

const request = require('supertest');
const express = require('express');
const goalRouter = require('../src/routes/goal-route');
const { StatusCodes } = require('http-status-codes');
const {
  getUserGoals: mockGetUserGoals,
} = require('../src/services/goal-service');

jest.mock('../src/services/goal-service');

const app = express();
app.use(express.json());

// Mock middleware to inject req.user
app.use((req, res, next) => {
  req.user = { id: 1 }; // user id를 1로 mock
  next();
});

app.use('/', goalRouter);

describe('GET /goals', () => {
  it('should return user goals', async () => {
    const mockGoals = [
      {
        id: 1,
        title: 'Read a book',
        description: 'Read a new book every week',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        type: 'personal',
        status: 'ongoing',
      },
    ];

    mockGetUserGoals.mockResolvedValue({
      userId: 1,
      goals: mockGoals,
    });

    const response = await request(app)
      .get('/goals')
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual({
      userId: 1,
      goals: mockGoals,
    });
  });

  it('should handle errors properly', async () => {
    mockGetUserGoals.mockRejectedValue(new Error('Something went wrong'));

    const response = await request(app)
      .get('/goals')
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.error).toBe('Internal Server Error');
  });
});
