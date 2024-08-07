const validationService = require('../services/validation-location-team-sevice.js');

const getValidationLocationTeam = async (req, res) => {
  const goalId = parseInt(req.params.goal_id, 10);
  const userId = parseInt(req.query.user_id, 10);
  try {
    const goal = await validationService.getValidationLocationTeam(goalId, userId);
    res.status(200).json(goal);
  } catch (error) {
    console.error('Error in getGoalWithProgress:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getValidationLocationTeam,
};
