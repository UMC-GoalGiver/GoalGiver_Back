const { getGoalsByDateRange } = require('../models/goal-model');

exports.getGoals = async (week_start, week_end) => {
  const goals = await getGoalsByDateRange(week_start, week_end);

  const response = {
    week_start,
    week_end,
    goals,
  };

  response.goals = Object.values(response.goals).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return response;
};
