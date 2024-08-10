// ./src/services/goal-service.js
const { getGoalsByDateRange } = require('../models/goal-model');

/**
 * @function getGoals
 * @description 주어진 날짜 범위 내의 목표를 조회하여 구조화된 데이터로 반환합니다.
 * @param {number} userId - 사용자 ID
 * @param {string} week_start - 조회 시작 날짜 (YYYY-MM-DD)
 * @param {string} week_end - 조회 종료 날짜 (YYYY-MM-DD)
 * @returns {Object} 주간 목표 데이터
 */
exports.getGoals = async (userId, week_start, week_end) => {
  const goals = await getGoalsByDateRange(userId, week_start, week_end);

  const response = {
    week_start,
    week_end,
    goals: goals.reduce((acc, goal) => {
      // UTC 날짜를 로컬 날짜로 변환
      const goalDate = new Date(goal.date);
      const localDate = new Date(
        goalDate.getTime() - goalDate.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split('T')[0]; // 로컬 날짜 문자열 추출

      if (!acc[localDate]) {
        acc[localDate] = { date: localDate, goals: [] };
      }
      acc[localDate].goals.push(goal);
      return acc;
    }, {}),
  };

  response.goals = Object.values(response.goals).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return response;
};
