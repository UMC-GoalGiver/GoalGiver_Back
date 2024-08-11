// tests/unit/goal-controller.test.js

const request = require('supertest');
const express = require('express');
const { StatusCodes } = require('http-status-codes');
const goalRouter = require('../src/routes/goal-route');

jest.mock('../src/services/goal-service');

const { calculateLocation } = require('../src/services/goal-service');

const app = express();

// Body parser 및 미들웨어 설정
app.use(express.json());
app.use('/goals', goalRouter);

describe('POST /goals/:goalInstanceId/validate/location', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // 각 테스트 전 모의 함수 초기화
  });

  it('should return 200 for successful location validation', async () => {
    calculateLocation.mockResolvedValue(true);

    const response = await request(app)
      .post('/goals/1/validate/location')
      .send({ latitude: 37.7749, longitude: -122.4194 });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('message', '위치 인증 성공');
  });

  it('should return 400 for failed location validation', async () => {
    calculateLocation.mockResolvedValue(false);

    const response = await request(app)
      .post('/goals/1/validate/location')
      .send({ latitude: 37.7749, longitude: -122.4194 });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty('message', '위치 인증 실패');
  });

  it('should return 409 for duplicate location validation', async () => {
    calculateLocation.mockRejectedValue(new Error('이미 완료된 인증입니다.'));

    const response = await request(app)
      .post('/goals/1/validate/location')
      .send({ latitude: 37.7749, longitude: -122.4194 });

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body).toHaveProperty('message', '이미 완료된 인증입니다.');
  });

  it('should return 404 if goal is not found', async () => {
    calculateLocation.mockRejectedValue(new Error('목표가 없습니다'));

    const response = await request(app)
      .post('/goals/1/validate/location')
      .send({ latitude: 37.7749, longitude: -122.4194 });

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(response.body).toHaveProperty(
      'message',
      '해당 목표를 찾을 수 없습니다.'
    );
  });

  it('should return 500 on unexpected errors', async () => {
    calculateLocation.mockRejectedValue(new Error('Unexpected error'));

    const response = await request(app)
      .post('/goals/1/validate/location')
      .send({ latitude: 37.7749, longitude: -122.4194 });

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toHaveProperty('message', '위치 인증 중 오류 발생');
  });
});
