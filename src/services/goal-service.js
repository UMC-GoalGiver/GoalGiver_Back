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
