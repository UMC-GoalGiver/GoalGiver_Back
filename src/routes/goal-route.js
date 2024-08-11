const express = require('express');

const { getWeeklyGoals } = require('../controllers/goal-controller');

const { getUserGoals } = require('../controllers/goal-controller'); // 작성자: Minjae Han

const { createGoal } = require('../controllers/goal-controller'); // 작성자: Minjae Han

const goalRouter = express.Router();

goalRouter.get('/week', getWeeklyGoals);

goalRouter.get('/', getUserGoals); // 작성자: Minjae Han

goalRouter.post('/', createGoal); // 작성자: Minjae Han

module.exports = goalRouter;
