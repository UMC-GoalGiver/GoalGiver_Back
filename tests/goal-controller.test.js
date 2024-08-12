// tests/goal-controller.test.js

const request = require('supertest');
const express = require('express');
const goalRouter = require('../src/routes/goal-route');

const { setTestUser } = require('../src/middlewares/set-test-user');

jest.mock('../src/services/goal-service');

const {
  uploadPhotoAndValidate,
  requestTeamValidationService,
} = require('../src/services/goal-service');

const app = express();
app.use(express.json());
app.use(setTestUser); // 가짜 사용자 설정 미들웨어
app.use('/goals', goalRouter);

describe('Goal Validation APIs', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // 각 테스트 전 모의 함수 초기화
  });

  describe('POST /goals/:goalInstanceId/validate/photo', () => {
    it('should return 200 and success message when photo validation is successful', async () => {
      uploadPhotoAndValidate.mockResolvedValue('photo-url');

      const response = await request(app)
        .post('/goals/1/validate/photo')
        .attach('photo', Buffer.from('fake image content'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: '인증 성공',
        data: 'photo-url',
      });

      expect(uploadPhotoAndValidate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ id: 1 })
      );
    });

    it('should return 403 if user does not have permission', async () => {
      uploadPhotoAndValidate.mockRejectedValue(
        new Error('접근 권한이 없습니다. (아이디 불일치)')
      );

      const response = await request(app)
        .post('/goals/1/validate/photo')
        .attach('photo', Buffer.from('fake image content'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'message',
        '접근 권한이 없습니다. (아이디 불일치)'
      );
    });

    it('should return 400 if the goal type is invalid', async () => {
      uploadPhotoAndValidate.mockRejectedValue(
        new Error('사진 인증 타입이 아닙니다.')
      );

      const response = await request(app)
        .post('/goals/1/validate/photo')
        .attach('photo', Buffer.from('fake image content'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'message',
        '사진 인증 타입이 아닙니다.'
      );
    });

    it('should return 409 if the request is already validated', async () => {
      uploadPhotoAndValidate.mockRejectedValue(
        new Error('이미 인증된 요청입니다.')
      );

      const response = await request(app)
        .post('/goals/1/validate/photo')
        .attach('photo', Buffer.from('fake image content'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty(
        'message',
        '이미 인증된 요청입니다.'
      );
    });

    it('should return 500 on unexpected error', async () => {
      uploadPhotoAndValidate.mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .post('/goals/1/validate/photo')
        .attach('photo', Buffer.from('fake image content'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', '에러로 인한 인증 실패');
    });
  });

  describe('POST /goals/:goalInstanceId/validate/team', () => {
    it('should return 200 and success message when team validation is requested successfully', async () => {
      requestTeamValidationService.mockResolvedValue();

      const response = await request(app).post('/goals/1/validate/team').send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: '인증 요청이 성공적으로 전송되었습니다.',
        data: undefined,
      });

      expect(requestTeamValidationService).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ id: 1 })
      );
    });

    it('should return 403 if user does not have permission', async () => {
      requestTeamValidationService.mockRejectedValue(
        new Error('접근 권한이 없습니다. (아이디 불일치)')
      );

      const response = await request(app).post('/goals/1/validate/team').send();

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'message',
        '접근 권한이 없습니다. (아이디 불일치)'
      );
    });

    it('should return 400 if the goal type is invalid', async () => {
      requestTeamValidationService.mockRejectedValue(
        new Error('유효한 목표 타입이 아닙니다.')
      );

      const response = await request(app).post('/goals/1/validate/team').send();

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'message',
        '유효한 목표 타입이 아닙니다.'
      );
    });

    it('should return 500 on unexpected error', async () => {
      requestTeamValidationService.mockRejectedValue(
        new Error('Unexpected error')
      );

      const response = await request(app).post('/goals/1/validate/team').send();

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        'message',
        '인증 요청 전송 중 에러 발생'
      );
    });
  });
});
