const {
  getGoalById,
  saveValidationResult,
  notifyTeamMemebers,
} = require('../models/goal-model');

exports.uploadPhotoAndValidate = async (req, user) => {
  const photoUrl = req.file.location;
  const goalId = req.params.goalId;

  const goal = await getGoalById(goalId);
  if (user.id !== goal.user_id) {
    // res.locals.user에서 가져온 사용자 ID
    throw new Error('접근 권한이 없습니다. (아이디 불일치)');
  }
  if (goal.type === 'personal') {
    await saveValidationResult(goalId, photoUrl);
    return photoUrl;
  } else if (goal.type === 'team') {
    await notifyTeamMemebers(goalId, user, photoUrl);
    return photoUrl;
  } else {
    throw new Error('유효한 목표 타입이 아닙니다.');
  }
};
