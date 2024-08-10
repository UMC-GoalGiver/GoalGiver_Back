// ./src/services/goal-service.js
const { getGoalsByDateRange } = require('../models/goal-model');

exports.getGoals = async (week_start, week_end) => {
  const goals = await getGoalsByDateRange(week_start, week_end);

  const response = {
    week_start,
    week_end,
    goals: goals.reduce((acc, goal) => {
      const goalDate = goal.date.toISOString().split('T')[0];
      if (!acc[goalDate]) {
        acc[goalDate] = { date: goalDate, goals: [] };
      }
      acc[goalDate].goals.push(goal);
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
