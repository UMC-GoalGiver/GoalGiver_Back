const express = require('express');

const { imageUploader } = require('../middlewares/image-upload');

const {
  getUserGoals,
  createGoal,
  getWeeklyGoals,
  validatePhoto,
  requestTeamValidation,
  validateLocation,
  acceptValidation,
} = require('../controllers/goal-controller'); // 작성자: Minjae Han

const goalRouter = express.Router();

/**
 * @route POST /:instanceId/validate/accept
 * @description 목표 인스턴스에 대한 인증 수락을 처리
 */
goalRouter.post('/:instanceId/validate/accept', acceptValidation);

/**
 * @route GET /goals/week
 * @description 주간 목표를 조회합니다.
 * @queryParam {string} week_start - 조회 시작 날짜 (YYYY-MM-DD)
 * @queryParam {string} week_end - 조회 종료 날짜 (YYYY-MM-DD)
 */

goalRouter.get('/week', getWeeklyGoals);

goalRouter.get('/', getUserGoals); // 작성자: Minjae Han

goalRouter.post('/', createGoal); // 작성자: Minjae Han

goalRouter.post('/:instanceId/validate/location', validateLocation);

/**
 * @route POST /goals/:goalInstanceId/validate/photo
 * @description 목표 사진 인증을 처리합니다.
 * @param {number} goalInstanceId - 인증할 목표 인스턴스 ID
 */
goalRouter.post(
  '/:goalInstanceId/validate/photo',
  imageUploader.single('photo'),
  validatePhoto
);

/**
 * @route POST /goals/:goalId/validate/team
 * @description 팀원 인증을 처리합니다.
 * @param {number} goalInstanceId - 인증할 목표 인스턴스 ID
 */
goalRouter.post('/:goalInstanceId/validate/team', requestTeamValidation);

/**
 * @route GET /goals/week
 * @description 주간 목표를 조회합니다.
 * @queryParam {string} week_start - 조회 시작 날짜 (YYYY-MM-DD)
 * @queryParam {string} week_end - 조회 종료 날짜 (YYYY-MM-DD)
 */
goalRouter.get('/week', getWeeklyGoals);

goalRouter.get('/', getUserGoals); // 작성자: Minjae Han

goalRouter.post('/', createGoal); // 작성자: Minjae Han

module.exports = goalRouter;
