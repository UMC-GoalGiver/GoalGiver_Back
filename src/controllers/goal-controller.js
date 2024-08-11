const { calculateLocation } = require('../services/goal-service');
const { StatusCodes } = require('http-status-codes');

/**
 * @function validateLocation
 * @description 목표 인스턴스에 대한 위치 인증을 처리합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
exports.validateLocation = async (req, res) => {
  try {
    const { instanceId } = req.params;
    const { latitude, longitude } = req.body;

    const result = await calculateLocation(instanceId, latitude, longitude);

    if (result) {
      res.status(StatusCodes.OK).json({ message: '위치 인증 성공' });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ message: '위치 인증 실패' });
    }
  } catch (err) {
    if (err.message.includes('목표가 없습니다')) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: '해당 목표를 찾을 수 없습니다.',
      });
    } else if (err.message.includes('이미 완료된 인증입니다')) {
      res.status(StatusCodes.CONFLICT).json({
        message: '이미 완료된 인증입니다.',
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: '위치 인증 중 오류 발생',
        error: err.message,
      });
    }
  }
};
