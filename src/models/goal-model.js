const pool = require('../../config/database');

exports.getGoalsByDateRange = async (week_start, week_end) => {
  const query = 'SELECT * FROM goals WHERE start_date >= ? AND end_date <= ?';

  const [rows] = await pool.execute(query, [week_start, week_end]);
  return rows;
};
