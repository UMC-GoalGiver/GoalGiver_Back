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

// 작성자: Minjae Han

const { getUserGoals } = require('../services/goal-service');
const { StatusCodes } = require('http-status-codes');

exports.getUserGoals = async (req, res, next) => {
  try {
    const userId = req.user?.id; // req.user가 정의되지 않은 경우를 대비해 안전하게 처리
    if (!userId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: '유효하지 않은 사용자 ID입니다.' });
    }

    const goals = await getUserGoals(userId);
    res.status(StatusCodes.OK).json(goals);
  } catch (err) {
    console.error('내 목표 조회 API 에러: ', err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal Server Error' });
  }
};

// 작성자: Minjae Han

const { createGoal } = require('../services/goal-service');

exports.createGoal = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: '유효하지 않은 사용자 ID입니다.' });
    }

    const { title, startDate, endDate, type, validationType } = req.body;

    // 필수 필드 검증
    if (!title || !startDate || !endDate || !type || !validationType) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: '유효하지 않은 요청입니다.' });
    }

    const goalData = req.body;
    goalData.userId = userId;

    const newGoal = await createGoal(goalData);
    res.status(StatusCodes.CREATED).json(newGoal);
  } catch (err) {
    console.error('목표 추가 API 에러: ', err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal Server Error' });
  }
};
