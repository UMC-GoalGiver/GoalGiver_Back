// goal-controller.test.js

// 작성자: Minjae Han

const request = require('supertest');
const express = require('express');
const goalRouter = require('../src/routes/goal-route');
const { StatusCodes } = require('http-status-codes');
const {
  getUserGoals: mockGetUserGoals,
  createGoal: mockCreateGoal,
} = require('../src/services/goal-service');

jest.mock('../src/services/goal-service');

const app = express();
app.use(express.json());

// Mock middleware to inject req.user
app.use((req, res, next) => {
  req.user = { id: 1 }; // user id를 1로 mock
  next();
});

app.use('/goal', goalRouter); // 라우터 설정을 '/goal'로 변경

describe('GET /goal', () => {
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
      .get('/goal') // '/goals' -> '/goal'로 수정
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
      .get('/goal') // '/goals' -> '/goal'로 수정
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.error).toBe('Internal Server Error');
  });
});

describe('POST /goal', () => {
  it('should create a personal goal', async () => {
    const mockGoal = {
      id: 1,
      title: '달리기 챌린지',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      type: 'personal',
      validationType: 'photo',
      latitude: 37.7749,
      longitude: -122.4194,
      emoji: '🏃',
      donationOrganizationId: 1,
      donationAmount: 1000,
    };

    mockCreateGoal.mockResolvedValue(mockGoal);

    const response = await request(app)
      .post('/goal') // '/goals' -> '/goal'로 수정
      .send(mockGoal)
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toEqual(expect.objectContaining(mockGoal));
  });

  it('should create a team goal with members', async () => {
    const mockGoal = {
      id: 2,
      title: '팀 달리기 챌린지',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      type: 'team',
      validationType: 'team',
      teamMemberIds: [2, 3, 4],
      timeAttack: false,
      startTime: '09:00:00',
      endTime: '10:00:00',
      repeatType: 'weekly',
      daysOfWeek: ['mon', 'wed', 'fri'],
    };

    mockCreateGoal.mockResolvedValue(mockGoal);

    const response = await request(app)
      .post('/goal') // '/goals' -> '/goal'로 수정
      .send(mockGoal)
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toEqual(expect.objectContaining(mockGoal));
  });

  it('should return an error if required fields are missing', async () => {
    const response = await request(app)
      .post('/goal') // '/goals' -> '/goal'로 수정
      .send({
        title: '', // Title is required, this should fail
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        type: 'personal',
        validationType: 'photo',
      })
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toEqual({
      error: '유효하지 않은 요청입니다.',
    });
  });

  it('should handle errors properly', async () => {
    mockCreateGoal.mockRejectedValue(new Error('Something went wrong'));

    const response = await request(app)
      .post('/goal') // '/goals' -> '/goal'로 수정
      .send({
        title: '팀 달리기 챌린지',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        type: 'team',
        validationType: 'team',
        teamMemberIds: [2, 3, 4],
        timeAttack: false,
        startTime: '09:00:00',
        endTime: '10:00:00',
      })
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.error).toBe('Internal Server Error');
  });
});
