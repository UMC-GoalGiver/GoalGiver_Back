const {
  updateTeamValidation,
  areAllTeamMembersAccepted,
  markGoalValidationAsCompleted,
  getGoalInstance,
} = require('../models/goal-model');

exports.acceptTeamValidation = async (validationId, userId) => {
  // 인증 수락 상태 업데이트
  await updateTeamValidation(validationId, userId);

  const allAccepted = await areAllTeamMembersAccepted(validationId);

  if (allAccepted) {
    const goalInstanceId = await getGoalInstance(validationId);
    await markGoalValidationAsCompleted(goalInstanceId);
  }

  return allAccepted;
};
