const { getGoals } = require('../services/goal-service');
const { StatusCodes } = require('http-status-codes');

/**
 * @function isValidDate
 * @description 주어진 문자열이 유효한 날짜인지 확인합니다.
 * @param {string} dateString - 확인할 날짜 문자열
 * @returns {boolean} 유효한 날짜인지 여부
 */
const isValidDate = (dateString) => {
  return !isNaN(Date.parse(dateString));
};

/**
 * @function getWeeklyGoals
 * @description 주간 목표를 조회하여 클라이언트에 반환합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - Express next 미들웨어 함수
 */
exports.getWeeklyGoals = async (req, res, next) => {
  const { week_start, week_end } = req.query;
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'userId가 올바르지 않습니다.' });
  }
  // 쿼리 파라미터가 없는 경우 처리
  if (!week_start || !week_end) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'week_start 또는 week_end가 없습니다.' });
  }

  // 유효한 날짜 형식인지 확인
  if (!isValidDate(week_start) || !isValidDate(week_end)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: '유효한 날짜 형식이 아닙니다.' });
  }

  // 날짜 객체로 변환
  const startDate = new Date(week_start);
  const endDate = new Date(week_end);

  // 시작 날짜가 종료 날짜보다 이후인 경우
  if (startDate > endDate) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: '시작 날짜는 종료 날짜보다 이전이어야 합니다.' });
  }

  // 기간이 7일을 넘는 경우
  const differenceInTime = endDate.getTime() - startDate.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);

  if (differenceInDays > 7) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: '기간은 최대 7일 이내여야 합니다.' });
  }

  try {
    const goals = await getGoals(userId, week_start, week_end);
    res.status(StatusCodes.OK).json(goals);
  } catch (err) {
    console.error('주간 목표 조회 에러', err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: '주간 목표 조회 에러' });
    next(err);
  }
};
