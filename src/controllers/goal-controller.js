const { uploadPhotoAndValidate } = require('../services/goal-service');
const { StatusCodes } = require('http-status-codes');
/**
 * @function validatePhoto
 * @description 목표 사진 인증을 처리하고 결과를 반환합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */

// src/controllers/goal-controller.js

exports.validatePhoto = async (req, res) => {
  try {
    const result = await uploadPhotoAndValidate(req, res.locals.user);
    res.status(StatusCodes.OK).json({ message: '인증 성공', data: result });
  } catch (error) {
    if (error.message.includes('접근 권한이 없습니다')) {
      // 권한 오류
      res.status(StatusCodes.FORBIDDEN).json({
        message: '접근 권한이 없습니다. (아이디 불일치)',
      });
    } else if (error.message.includes('유효한 목표 타입이 아닙니다')) {
      // 잘못된 요청 오류
      res.status(StatusCodes.BAD_REQUEST).json({
        message: '유효한 목표 타입이 아닙니다.',
      });
    } else {
      // 기타 서버 오류
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: '에러로 인한 인증 실패',
        error: error.message,
      });
    }
  }
};
