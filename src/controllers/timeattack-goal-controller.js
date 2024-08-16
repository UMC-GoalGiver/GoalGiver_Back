const goalService = require('../services/timeattack-goal-sevice.js');

// 팀미션(타임어택) 진행상황
const getTeamGoalTimeAttack = async (req, res) => {
  const goalId = parseInt(req.params.goal_id, 10);
  const userId = parseInt(req.query.user_id, 10);

  try {
    if (!goalId || !userId) {
      throw new Error('Goal ID and User ID are required');
    }
    const goal = await goalService.getTeamGoalTimeAttack(goalId, userId);
    res.json(goal);
  } catch (error) {
    if (error.message === 'Goal not found') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server Error' });
    }
  }
};

module.exports = { getTeamGoalTimeAttack };
