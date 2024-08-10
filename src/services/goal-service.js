const {
  getGoalById,
  saveValidationResult,
  notifyTeamMembers,
} = require('../models/goal-model');

/**
 * @function uploadPhotoAndValidate
 * @description 사진을 S3에 업로드하고 목표 인증을 처리합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} user - 인증된 사용자 정보
 * @returns {Promise<string>} 업로드된 사진 URL
 * @throws {Error} 권한 에러 또는 인증 타입 에러
 */
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
    await notifyTeamMembers(goalId, user, photoUrl);
    return photoUrl;
  } else {
    throw new Error('유효한 목표 타입이 아닙니다.');
  }
};
