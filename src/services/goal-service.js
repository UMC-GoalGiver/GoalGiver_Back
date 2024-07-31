const {
  getGoalById,
  saveValidationResult,
  notifyTeamMemebers,
} = require('../models/goal-model');

exports.uploadPhotoAndValidate = async (req) => {
  const photoUrl = req.file.location;
  const goalId = req.params.goalId;
  const userId = req.user.id;

  const goal = await getGoalById(goalId);

  if (goal.type === 'personal') {
    await saveValidationResult(goalId, userId, photoUrl);
    return photoUrl;
  } else if (goal.type === 'team') {
    await notifyTeamMemebers(goalId, userId, photoUrl);
    return photoUrl;
  } else {
    throw new Error('유효한 목표 타입이 아닙니다.');
  }
};
