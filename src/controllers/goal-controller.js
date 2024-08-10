const { calculateLocation } = require('../services/goal-service');

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
      res.status(200).json({ message: '위치 인증 성공' });
    } else {
      res.status(400).json({ message: '위치 인증 실패' });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: '위치 인증 중 오류 발생', error: err.message });
  }
};
