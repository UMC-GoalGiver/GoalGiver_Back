const {
  updateTeamValidation,
  areAllTeamMembersAccepted,
  markGoalValidationAsCompleted,
} = require('../models/goal-model');

/**
 * @function acceptTeamValidation
 * @description 팀원의 인증 수락 상태를 업데이트하고 모든 팀원이 인증을 수락했는지 확인합니다.
 * @param {number} instanceId - 인스턴스 ID
 * @param {number} userId - 사용자 ID
 * @returns {Promise<boolean>} 모든 팀원이 수락했는지 여부
 */
exports.acceptTeamValidation = async (instanceId, userId) => {
  // 인증 수락 상태 업데이트
  await updateTeamValidation(instanceId, userId);

  const allAccepted = await areAllTeamMembersAccepted(instanceId);
  console.log(allAccepted);
  if (allAccepted) {
    await markGoalValidationAsCompleted(instanceId);
  }

  return allAccepted;
};
