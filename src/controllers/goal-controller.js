const { calculateLocation } = require('../services/goal-service');

exports.validateLocation = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { latitude, longitude } = req.body;
    const result = await calculateLocation(goalId, latitude, longitude);
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
