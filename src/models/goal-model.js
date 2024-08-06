const pool = require('../../config/database');

exports.getGoalById = async (goalId) => {
  const [rows] = await pool.query('select * from goals where id = ?', [goalId]);
  if (rows.length === 0) {
    throw new Error('Goal not found');
  }
  return rows[0];
};

exports.insertGoalValidation = async (goalId, latitude, longitude) => {
  await pool.query(
    'insert into goal_validation (goal_id, validation_data) values (?, ?)',
    [goalId, JSON.stringify({ latitude, longitude })]
  );
};
