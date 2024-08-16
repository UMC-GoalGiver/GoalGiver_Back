// 공통 서비스 함수
const getGoalProgress = async (goalModel, goalId, userId) => {
    if (!goalId || !userId) {
      throw new Error('Goal ID and User ID are required');
    }
    const goal = await goalModel.findGoalWithProgressById(goalId, userId);
    if (!goal) {
      throw new Error('Goal not found');
    }
    return goal;
  };
  
  // 주간, 월간, 연간 서비스 파일에서 사용
  module.exports = {
    getGoalWeeklyProgress: (goalId, userId) => getGoalProgress(weeklyGoalModel, goalId, userId),
    getGoalMonthlyProgress: (goalId, userId) => getGoalProgress(monthlyGoalModel, goalId, userId),
    getGoalYearlyProgress: (goalId, userId) => getGoalProgress(yearlyGoalModel, goalId, userId),
  };