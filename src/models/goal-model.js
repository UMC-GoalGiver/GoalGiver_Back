const pool = require('../../config/database');

/**
 * @function isValidationComplete
 * @description 특정 목표 인스턴스의 인증이 완료되었는지 확인합니다.
 * @param {number} instanceId - 목표 인스턴스 ID
 * @param {number} userId - 목표 인스턴스 ID
 * @returns {Promise<boolean>} 인증 완료 여부
 */
exports.isValidationComplete = async (instanceId, userId) => {
  const query =
    'select is_accepted from team_validation where validation_id = (select id from goal_validation where goal_instance_id = ?) and user_id = ?';
  try {
    const [rows] = await pool.execute(query, [instanceId, userId]);
    console.log(rows.length);
    return rows.length > 0 && rows[0].is_accepted;
  } catch (err) {
    console.error(err);
  }
};
/**
 * @function updateTeamValidation
 * @description 팀 목표의 인증 수락 상태를 업데이트합니다.
 * @param {number} instanceId - 목표 인스턴스 ID
 * @param {number} userId - 사용자 ID
 * @returns {Promise<void>}
 */
exports.updateTeamValidation = async (instanceId, userId) => {
  const query =
    'update team_validation set is_accepted = true, accepted_at = now() where validation_id = (select id from goal_validation where goal_instance_id = ?) and user_id = ?';
  await pool.execute(query, [instanceId, userId]);
};

/**
 * @function areAllTeamMembersAccepted
 * @description 모든 팀원이 인증을 수락했는지 확인합니다.
 * @param {number} instanceId - 목표 인스턴스 ID
 * @returns {Promise<boolean>} 모든 팀원이 수락했는지 여부
 */
exports.areAllTeamMembersAccepted = async (instanceId) => {
  const query =
    'select count(*) as total, sum(is_accepted) as accepted from team_validation where validation_id = (select id from goal_validation where goal_instance_id = ?)';
  const [rows] = await pool.execute(query, [instanceId]);

  return rows[0].total === Number(rows[0].accepted);
};

/**
 * @function markGoalValidationAsCompleted
 * @description 목표 인스턴스를 완료 상태로 마크합니다.
 * @param {number} instanceId - 목표 인스턴스 ID
 * @returns {Promise<void>}
 */
exports.markGoalValidationAsCompleted = async (instanceId) => {
  const query =
    'update goal_validation set validated_at = now() where goal_instance_id = ?';
  await pool.execute(query, [instanceId]);
};

/**
 * @function deleteNotificationByInstanceId
 * @description 특정 목표 인스턴스 ID와 관련된 알림을 삭제합니다.
 * @param {number} instanceId - 목표 인스턴스 ID
 * @returns {Promise<void>}
 */
exports.deleteNotification = async (instanceId) => {
  const query = `
  DELETE FROM notifications 
  WHERE JSON_EXTRACT(content, '$.goal.instance_id') = CAST(? AS JSON)
`;

  try {
    await pool.execute(query, [instanceId]);
  } catch (error) {
    console.error('Error deleting notification:', error); // 에러 로그
    throw error;
  }
};
