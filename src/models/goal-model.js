const pool = require('../../config/database');

exports.getGoalsByDateRange = async (week_start, week_end) => {
  const query =
    'select g.id as goal_id, gi.id as goal_instance_id, title, description, start_date, end_date, type, status, latitude, longitude,  validation_type, emoji, donation_organization_id, donation_amount, gi.date from goals g, goalinstances gi where g.id = gi.goal_id and start_date >= ? and end_date <= ?';

  try {
    const [rows] = await pool.execute(query, [week_start, week_end]);
    return rows;
  } catch (err) {
    console.error('날짜 범위에 따른 에러: ', err);
    throw err;
  }
};

// 작성자: Minjae Han

exports.getUserGoals = async (userId) => {
  const query = `
    SELECT g.id, g.title, g.description, g.start_date, g.end_date, g.type, g.status,
           g.latitude, g.longitude, g.validation_type, g.emoji,
           g.donation_organization_id, g.donation_amount
    FROM goals g
    WHERE g.user_id = ?
  `;

  try {
    // SQL 인젝션 방지를 위해 prepared statements 사용
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  } catch (err) {
    console.error('사용자 목표 조회 중 에러 발생: ', err);
    throw err;
  }
};
