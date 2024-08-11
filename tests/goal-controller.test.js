// tests/unit/goal-controller.test.js

const request = require('supertest');
const express = require('express');
const { StatusCodes } = require('http-status-codes');
const goalRouter = require('../src/routes/goal-route');
const { setTestUser } = require('../src/middlewares/set-test-user');

jest.mock('../src/services/goal-service');

const { acceptTeamValidation } = require('../src/services/goal-service');

const app = express();

// Body parser 및 미들웨어 설정
app.use(express.json());
app.use(setTestUser); // 미들웨어를 사용하여 임의의 사용자 설정
app.use('/goals', goalRouter);

describe('POST /goals/:goalInstanceId/validate/accept', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // 각 테스트 전 모의 함수 초기화
  });

  it('should return 200 and message when all team members accept', async () => {
    acceptTeamValidation.mockResolvedValue(true);

    const response = await request(app).post('/goals/1/validate/accept');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual({
      message: '모든 팀원이 인증을 수락하였습니다.',
    });

    expect(acceptTeamValidation).toHaveBeenCalledWith('1', 1); // instanceId를 문자열로 기대
  });

  it('should return 200 and message when not all team members have accepted', async () => {
    acceptTeamValidation.mockResolvedValue(false);

    const response = await request(app).post('/goals/2/validate/accept');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual({
      message: '인증을 수락하였습니다.',
    });

    expect(acceptTeamValidation).toHaveBeenCalledWith('2', 1); // instanceId를 문자열로 기대
  });

  it('should return 409 if validation is already complete', async () => {
    acceptTeamValidation.mockRejectedValue(
      new Error('이미 완료된 인증입니다.')
    );

    const response = await request(app).post('/goals/3/validate/accept');

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body).toHaveProperty('message', '이미 완료된 인증입니다.');

    expect(acceptTeamValidation).toHaveBeenCalledWith('3', 1); // instanceId를 문자열로 기대
  });

  it('should return 500 on unexpected errors', async () => {
    acceptTeamValidation.mockRejectedValue(new Error('Unexpected error'));

    const response = await request(app).post('/goals/4/validate/accept');

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toHaveProperty('message', '인증 처리 중 오류 발생');

    expect(acceptTeamValidation).toHaveBeenCalledWith('4', 1); // instanceId를 문자열로 기대
  });
});
