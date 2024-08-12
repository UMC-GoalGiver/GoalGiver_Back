// src/controllers/goal-controller.js

const {
  uploadPhotoAndValidate,
  requestTeamValidationService,
} = require('../services/goal-service');
const { StatusCodes } = require('http-status-codes');

/**
 * @function validatePhoto
 * @description 목표 사진 인증을 처리하고 결과를 반환합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
exports.validatePhoto = async (req, res) => {
  try {
    const result = await uploadPhotoAndValidate(req);
    res.status(StatusCodes.OK).json({ message: '인증 성공', data: result });
  } catch (error) {
    if (error.message.includes('접근 권한이 없습니다')) {
      res.status(StatusCodes.FORBIDDEN).json({
        message: '접근 권한이 없습니다. (아이디 불일치)',
      });
    } else if (error.message.includes('사진 인증 타입이 아닙니다')) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: '사진 인증 타입이 아닙니다.',
      });
    } else if (error.message.includes('이미 인증된 요청입니다')) {
      res.status(StatusCodes.CONFLICT).json({
        message: '이미 인증된 요청입니다.',
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: '에러로 인한 인증 실패',
        error: error.message,
      });
    }
  }
};

/**
 * @function validateTeam
 * @description 팀원 인증을 처리하고 결과를 반환합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
exports.requestTeamValidation = async (req, res) => {
  try {
    const result = await requestTeamValidationService(
      req.params.goalInstanceId,
      req.user
    );
    res.status(StatusCodes.OK).json({
      message: '인증 요청이 성공적으로 전송되었습니다.',
      data: result,
    });
  } catch (error) {
    if (error.message.includes('접근 권한이 없습니다')) {
      res.status(StatusCodes.FORBIDDEN).json({
        message: '접근 권한이 없습니다. (아이디 불일치)',
      });
    } else if (error.message.includes('유효한 목표 타입이 아닙니다')) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: '유효한 목표 타입이 아닙니다.',
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: '인증 요청 전송 중 에러 발생',
        error: error.message,
      });
    }
  }
};
