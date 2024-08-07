const pool = require('../../config/database');

exports.updateTeamValidation = async (validationId, userId) => {
  await pool.query(
    'update team_validation set is_accepted = true, accepted_at = now() where validation_id = ? and user_id = ?',
    [validationId, userId]
  );
};

exports.areAllTeamMembersAccepted = async (validationId) => {
  const [rows] = await pool.query(
    'select count(*) as total, sum(is_accepted) as accepted from team_validation where validation_id = ?',
    [validationId]
  );

  return rows[0].total === rows[0].accepted;
};

exports.getGoalInstance = async (validationId) => {
  const [rows] = await pool.query(
    'select goal_instance_id from goal_validation where id = ?',
    [validationId]
  );
  return rows[0].goal_instance_id;
};

exports.markGoalValidationAsCompleted = async (goalInstanceId) => {
  await pool.query(
    'update goal_validation set validated_at = now() where goal_instance_id = ?',
    [goalInstanceId]
  );
};
