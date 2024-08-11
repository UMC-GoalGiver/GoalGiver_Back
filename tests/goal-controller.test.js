// tests/unit/goal-controller.test.js

const request = require('supertest');
const express = require('express');
const { StatusCodes } = require('http-status-codes');
const goalRouter = require('../src/routes/goal-route');
const { setTestUser } = require('../src/middlewares/set-test-user');

jest.mock('../src/services/goal-service');

const { uploadPhotoAndValidate } = require('../src/services/goal-service');

const app = express();

// Body parser 및 미들웨어 설정
app.use(express.json());
app.use(setTestUser); // 미들웨어를 사용하여 임의의 사용자 설정
app.use('/goals', goalRouter);

describe('POST /goals/:goalInstanceId/validate/photo', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // 각 테스트 전 모의 함수 초기화
  });

  it('should return 403 if user does not own the goal', async () => {
    uploadPhotoAndValidate.mockRejectedValue(
      new Error('접근 권한이 없습니다. (아이디 불일치)')
    );

    const response = await request(app)
      .post('/goals/3/validate/photo')
      .attach('photo', Buffer.from('fake image content'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
    expect(response.body).toHaveProperty(
      'message',
      '접근 권한이 없습니다. (아이디 불일치)'
    );

    expect(uploadPhotoAndValidate).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ id: 1 })
    );
  });

  it('should return 400 for invalid goal type', async () => {
    uploadPhotoAndValidate.mockRejectedValue(
      new Error('유효한 목표 타입이 아닙니다.')
    );

    const response = await request(app)
      .post('/goals/4/validate/photo')
      .attach('photo', Buffer.from('fake image content'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty(
      'message',
      '유효한 목표 타입이 아닙니다.'
    );

    expect(uploadPhotoAndValidate).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ id: 1 })
    );
  });

  it('should return 409 if the request is already validated', async () => {
    uploadPhotoAndValidate.mockRejectedValue(
      new Error('이미 인증된 요청입니다.')
    );

    const response = await request(app)
      .post('/goals/5/validate/photo')
      .attach('photo', Buffer.from('fake image content'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body).toHaveProperty('message', '이미 인증된 요청입니다.');

    expect(uploadPhotoAndValidate).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ id: 1 })
    );
  });

  it('should return 500 on unexpected errors', async () => {
    uploadPhotoAndValidate.mockRejectedValue(new Error('Unexpected error'));

    const response = await request(app)
      .post('/goals/6/validate/photo')
      .attach('photo', Buffer.from('fake image content'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toHaveProperty('message', '에러로 인한 인증 실패');

    expect(uploadPhotoAndValidate).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ id: 1 })
    );
  });
});
