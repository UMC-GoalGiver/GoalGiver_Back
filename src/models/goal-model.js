const pool = require('../../config/database');

exports.getGoalById = async (goalId) => {
  const [rows] = await pool.query('select * from goals where id = ?', [goalId]);
  if (rows.length === 0) {
    throw new Error('Goal not found');
  }
  return rows[0];
};
