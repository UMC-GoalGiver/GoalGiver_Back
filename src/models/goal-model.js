const pool = require('../../config/database');

/**
 * @function getGoalsByDateRange
 * @description 특정 날짜 범위 내의 목표 인스턴스를 조회합니다.
 * @param {string} week_start - 조회 시작 날짜 (YYYY-MM-DD)
 * @param {string} week_end - 조회 종료 날짜 (YYYY-MM-DD)
 * @returns {Promise<Array>} 목표 인스턴스 배열
 * @throws {Error} 데이터베이스 조회 에러
 */
exports.getGoalsByDateRange = async (week_start, week_end) => {
  const query =
    'select g.id as goal_id, gi.id as goal_instance_id, title, description, start_date, end_date, type, status, latitude, longitude,  validation_type, emoji, donation_organization_id, donation_amount, gi.date from goals g, goal_instances gi where g.id = gi.goal_id and start_date >= ? and end_date <= ?';

  try {
    const [rows] = await pool.execute(query, [week_start, week_end]);
    return rows;
  } catch (err) {
    console.error('날짜 범위에 따른 에러: ', err);
    throw err;
  }
};
