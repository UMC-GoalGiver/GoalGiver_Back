const request = require('supertest');
const express = require('express');
const goalRouter = require('../src/routes/goal-route');
const { setTestUser } = require('../src/middlewares/set-test-user');

const app = express();

app.use(express.json());
app.use(setTestUser); // 미들웨어를 사용하여 임의의 사용자 설정
app.use('/goals', goalRouter);

jest.mock('../src/services/goal-service', () => ({
  getGoals: jest.fn(),
}));

const { getGoals } = require('../src/services/goal-service');

describe('GET /goals/week', () => {
  it('should return 400 if week_start or week_end is missing', async () => {
    const response = await request(app).get('/goals/week');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'week_start 또는 week_end가 없습니다.',
    });
  });

  it('should return 200 and goals data', async () => {
    const mockGoals = {
      week_start: '2024-07-21',
      week_end: '2024-07-27',
      goals: [],
    };
    getGoals.mockResolvedValue(mockGoals);

    const response = await request(app)
      .get('/goals/week')
      .query({ week_start: '2024-07-21', week_end: '2024-07-27' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockGoals);
    expect(getGoals).toHaveBeenCalledWith(1, '2024-07-21', '2024-07-27');
  });

  it('should handle errors from getGoals service', async () => {
    getGoals.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/goals/week')
      .query({ week_start: '2024-07-21', week_end: '2024-07-27' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', '주간 목표 조회 에러');
  });
});
