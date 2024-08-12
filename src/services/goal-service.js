const {
  getGoalByInstanceId,
  saveValidationResult,
  notifyTeamMembers,
  initializeTeamValidation,
  checkForExistingValidation,
} = require('../models/goal-model');

/**
 * @function uploadPhotoAndValidate
 * @description 사진을 S3에 업로드하고 목표 인증을 처리합니다.
 * @param {Object} req - Express 요청 객체
 * @returns {Promise<string>} 업로드된 사진 URL
 * @throws {Error} 권한 에러 또는 인증 타입 에러
 */
exports.uploadPhotoAndValidate = async (req) => {
  const photoUrl = req.file.location;
  const instanceId = req.params.goalInstanceId;

  const goalInstance = await getGoalByInstanceId(instanceId);
  if (!goalInstance) {
    throw new Error('목표 정보를 찾을 수 없습니다.');
  }
  if (req.user.id !== goalInstance.user_id) {
    throw new Error('접근 권한이 없습니다. (아이디 불일치)');
  }
  if (goalInstance.validation_type !== 'photo') {
    throw new Error('사진 인증 타입이 아닙니다.');
  }

  // 중복 데이터 검사
  const existingValidation = await checkForExistingValidation(instanceId);
  if (existingValidation) {
    throw new Error('이미 인증된 요청입니다.');
  }

  await saveValidationResult(goalInstance.id, instanceId, photoUrl);

  return photoUrl;
};

exports.requestTeamValidationService = async (instanceId, user) => {
  const goalInstance = await getGoalByInstanceId(instanceId);
  if (!goalInstance) {
    throw new Error('목표 정보를 찾을 수 없습니다.');
  }
  if (user.id !== goalInstance.user_id) {
    throw new Error('접근 권한이 없습니다. (아이디 불일치)');
  }
  if (goalInstance.type !== 'team') {
    throw new Error('유효한 목표 타입이 아닙니다.');
  }
  // 팀원 인증 초기화
  await initializeTeamValidation(instanceId, user.id);

  // 팀원들에게 알림 전송
  await notifyTeamMembers(instanceId, user);
};
