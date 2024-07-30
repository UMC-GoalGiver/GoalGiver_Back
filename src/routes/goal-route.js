const express = require('express');

const { getWeeklyGoals } = require('../controllers/goal-controller');

const goalRouter = express.Router();

goalRouter.get('/week', getWeeklyGoals);

module.exports = goalRouter;
