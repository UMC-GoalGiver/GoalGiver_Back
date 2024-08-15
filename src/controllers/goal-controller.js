const { getGoals } = require('../services/goal-service');

exports.getWeeklyGoals = async (req, res, next) => {
  const { week_start, week_end } = req.query;

  if (!week_start || !week_end) {
    return res
      .status(400)
      .json({ error: 'week_start 또는 week_end가 없습니다.' });
  }
  try {
    const goals = await getGoals(week_start, week_end);

    res.json(goals);
  } catch (err) {
    console.error(err);
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
