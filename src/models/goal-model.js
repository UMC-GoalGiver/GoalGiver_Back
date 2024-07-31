const pool = require('../../config/database');

exports.getGoalById = async (goalId) => {
  const [rows] = pool.query('select * from goals where id = ?', [goalId]);
  return rows[0];
};
exports.saveValidationResult = async (goalId, userId, photoUrl) => {
  await pool.query(
    'insert into goal_validations (goal_id, user_id, validation_data values(?, ?, ?)',
    [goalId, userId, photoUrl]
  );
};
