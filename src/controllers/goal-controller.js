const { getGoals } = require('../services/goal-service');

/**
 * @function getWeeklyGoals
 * @description 주간 목표를 조회하여 클라이언트에 반환합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - Express next 미들웨어 함수
 */
exports.getWeeklyGoals = async (req, res, next) => {
  const { week_start, week_end } = req.query;
  const userId = res.locals.user.id;
  if (!week_start || !week_end) {
    return res
      .status(400)
      .json({ error: 'week_start 또는 week_end가 없습니다.' });
  }
  try {
    const goals = await getGoals(userId, week_start, week_end);

    res.status(200).json(goals);
  } catch (err) {
    console.error('주간 목표 조회 에러', err);
    res.status(500).json({ message: '주간 목표 조회 에러' });
    next(err);
  }
};
