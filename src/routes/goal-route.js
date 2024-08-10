const express = require('express');

const goalController = require('../controllers/goal-controller');

const goalRouter = express.Router();

/**
 * @route GET /goals/week
 * @description 주간 목표를 조회합니다.
 * @queryParam {string} week_start - 조회 시작 날짜 (YYYY-MM-DD)
 * @queryParam {string} week_end - 조회 종료 날짜 (YYYY-MM-DD)
 */
goalRouter.get('/week', goalController.getWeeklyGoals);

module.exports = goalRouter;
