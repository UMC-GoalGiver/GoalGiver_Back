
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
// ./src/services/goal-service.js
const { getGoalsByDateRange } = require('../models/goal-model');

/**
 * @function getGoals
 * @description 주어진 날짜 범위 내의 목표를 조회하여 구조화된 데이터로 반환합니다.
 * @param {number} userId - 사용자 ID
 * @param {string} week_start - 조회 시작 날짜 (YYYY-MM-DD)
 * @param {string} week_end - 조회 종료 날짜 (YYYY-MM-DD)
 * @returns {Object} 주간 목표 데이터
 */
exports.getGoals = async (userId, week_start, week_end) => {
  const goals = await getGoalsByDateRange(userId, week_start, week_end);

  const response = {
    week_start,
    week_end,
    goals: goals.reduce((acc, goal) => {
      // UTC 날짜를 로컬 날짜로 변환
      const goalDate = new Date(goal.date);
      const localDate = new Date(
        goalDate.getTime() - goalDate.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split('T')[0]; // 로컬 날짜 문자열 추출

      if (!acc[localDate]) {
        acc[localDate] = { date: localDate, goals: [] };
      }
      acc[localDate].goals.push(goal);
      return acc;
    }, {}),
  };

  response.goals = Object.values(response.goals).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return response;
};

// 작성자: Minjae Han

const { getUserGoals } = require('../models/goal-model');

exports.getUserGoals = async (userId) => {
  try {
    const goals = await getUserGoals(userId);

    // 데이터 유효성 검사를 추가합니다.
    if (!Array.isArray(goals)) {
      throw new Error('목표 조회 결과가 유효하지 않습니다.');
    }

    const response = {
      userId,
      goals: goals.map((goal) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        startDate: goal.start_date,
        endDate: goal.end_date,
        type: goal.type,
        status: goal.status,
        latitude: goal.latitude,
        longitude: goal.longitude,
        validationType: goal.validation_type,
        emoji: goal.emoji,
        donationOrganizationId: goal.donation_organization_id,
        donationAmount: goal.donation_amount,
      })),
    };

    return response;
  } catch (error) {
    console.error('사용자 목표 조회 중 에러 발생: ', error);
    throw error;
  }
};

// 작성자: Minjae Han

const {
  createPersonalGoal,
  createTeamGoal,
  createGoalRepeat,
} = require('../models/goal-model');

exports.createGoal = async (goalData) => {
  let newGoal;
  if (goalData.type === 'team') {
    newGoal = await createTeamGoal(goalData);
  } else {
    newGoal = await createPersonalGoal(goalData);
  }

  if (goalData.repeatType) {
    await createGoalRepeat(newGoal.id, goalData);
  }

  return newGoal;
};
