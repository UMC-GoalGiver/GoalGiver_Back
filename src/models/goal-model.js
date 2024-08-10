const pool = require('../../config/database');

/**
 * @function updateTeamValidation
 * @description 팀 목표의 인증 수락 상태를 업데이트합니다.
 * @param {number} instanceId - 목표 인스턴스 ID
 * @param {number} userId - 사용자 ID
 * @returns {Promise<void>}
 */

exports.updateTeamValidation = async (instanceId, userId) => {
  await pool.query(
    'update team_validation set is_accepted = true, accepted_at = now() where validation_id = (select id from goal_validation where goal_instance_id = ?) and user_id = ?',
    [instanceId, userId]
  );
};

/**
 * @function areAllTeamMembersAccepted
 * @description 모든 팀원이 인증을 수락했는지 확인합니다.
 * @param {number} instanceId - 목표 인스턴스 ID
 * @returns {Promise<boolean>} 모든 팀원이 수락했는지 여부
 */
exports.areAllTeamMembersAccepted = async (instanceId) => {
  const [rows] = await pool.query(
    'select count(*) as total, sum(is_accepted) as accepted from team_validation where validation_id = (select id from goal_validation where goal_instance_id = ?)',
    [instanceId]
  );

  return rows[0].total === rows[0].accepted;
};

/**
 * @function markGoalValidationAsCompleted
 * @description 목표 인스턴스를 완료 상태로 마크합니다.
 * @param {number} goalInstanceId - 목표 인스턴스 ID
 * @returns {Promise<void>}
 */
exports.markGoalValidationAsCompleted = async (goalInstanceId) => {
  await pool.query(
    'update goal_validation set validated_at = now() where goal_instance_id = ?',
    [goalInstanceId]
  );
};
