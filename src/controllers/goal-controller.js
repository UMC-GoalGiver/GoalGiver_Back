const { getGoals } = require('../services/goal-service');

exports.getWeeklyGoals = async (req, res, next) => {
  const { week_start, week_end } = req.query;

  if (!week_start || !week_end) {
    return res
      .status(400)
      .json({ error: 'week_start 또는 week_end가 없습니다.' });
  }
  try {
    const goals = await getGoals(week_start, week_end);

    res.json(goals);
  } catch (err) {
    console.error(err);
    next(err);
  }
};
