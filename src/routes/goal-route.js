const express = require('express');

const { getWeeklyGoals } = require('../controllers/goal-controller');

const goalRouter = express.Router();

goalRouter.get('/week', getWeeklyGoals);

// goalRouter.get('/:goalId/validate/photo', validatePhoto);

// goalRouter.get('/:goalId/validate/location', validateLocation);

module.exports = goalRouter;
