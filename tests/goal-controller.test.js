

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

app.use('/goal', goalRouter);

app.use('/goals', goalRouter);

jest.mock('../src/services/goal-service', () => ({
  getGoals: jest.fn(),
}));

const { getGoals } = require('../src/services/goal-service');

describe('GET /goals/week', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // 각 테스트 전 모의 함수 초기화
  });

  it('should return 400 if week_start or week_end is missing', async () => {
    const response = await request(app).get('/goals/week');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'week_start 또는 week_end가 없습니다.',
    });
  });

  it('should return 400 if week_start or week_end is not a valid date', async () => {
    const response = await request(app)
      .get('/goals/week')
      .query({ week_start: 'invalid-date', week_end: '2024-07-27' });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: '유효한 날짜 형식이 아닙니다.',
    });
  });

  it('should return 400 if start date is after end date', async () => {
    const response = await request(app)
      .get('/goals/week')
      .query({ week_start: '2024-07-28', week_end: '2024-07-27' });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: '시작 날짜는 종료 날짜보다 이전이어야 합니다.',
    });
  });

  it('should return 400 if the date range exceeds 7 days', async () => {
    const response = await request(app)
      .get('/goals/week')
      .query({ week_start: '2024-07-21', week_end: '2024-07-29' });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: '기간은 최대 7일 이내여야 합니다.',
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
      .get('/goal')
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
      .get('/goal')
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
      .post('/goal')
      .send(mockGoal)
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toEqual(expect.objectContaining(mockGoal));
  });

  it('should create a team goal with members and repeat instances', async () => {
    const mockGoal = {
      id: 2,
      title: '팀 달리기 챌린지',
      startDate: '2024-08-10',
      endDate: '2024-08-30',
      type: 'team',
      validationType: 'team',
      teamMemberIds: [2, 3, 4],
      timeAttack: false,
      startTime: '09:00:00',
      endTime: '10:00:00',
      repeatType: 'weekly',
      daysOfWeek: ['mon', 'wed', 'fri'],
    };

    const mockCreatedGoal = {
      ...mockGoal,
      id: 2,
      instances: [
        { date: '2024-08-12' },
        { date: '2024-08-14' },
        { date: '2024-08-16' },
        { date: '2024-08-19' },
        { date: '2024-08-21' },
        { date: '2024-08-23' },
        { date: '2024-08-26' },
        { date: '2024-08-28' },
        { date: '2024-08-30' },
      ],
    };

    mockCreateGoal.mockResolvedValue(mockCreatedGoal);

    const response = await request(app)
      .post('/goal')
      .send(mockGoal)
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toEqual(expect.objectContaining(mockCreatedGoal));
  });

  it('should create a team goal with monthly repeat instances', async () => {
    const mockGoal = {
      id: 3,
      title: '팀 월간 회의',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      type: 'team',
      validationType: 'team',
      teamMemberIds: [2, 3, 4],
      timeAttack: false,
      startTime: '09:00:00',
      endTime: '10:00:00',
      repeatType: 'monthly',
      dayOfMonth: 15, // 매달 15일에 반복
    };

    const mockCreatedGoal = {
      ...mockGoal,
      id: 3,
      instances: [
        { date: '2024-01-15' },
        { date: '2024-02-15' },
        { date: '2024-03-15' },
        { date: '2024-04-15' },
        { date: '2024-05-15' },
        { date: '2024-06-15' },
        { date: '2024-07-15' },
        { date: '2024-08-15' },
        { date: '2024-09-15' },
        { date: '2024-10-15' },
        { date: '2024-11-15' },
        { date: '2024-12-15' },
      ],
    };

    mockCreateGoal.mockResolvedValue(mockCreatedGoal);

    const response = await request(app)
      .post('/goal')
      .send(mockGoal)
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toEqual(expect.objectContaining(mockCreatedGoal));
  });

  it('should return an error if required fields are missing', async () => {
    const response = await request(app)
      .post('/goal')
      .send({
        title: '',
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
      .post('/goal')
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
