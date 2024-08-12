const express = require('express');

const goalController = require('../controllers/goal-controller');
const { imageUploader } = require('../middlewares/image-upload');

const goalRouter = express.Router();

/**
 * @route POST /goals/:goalInstanceId/validate/photo
 * @description 목표 사진 인증을 처리합니다.
 * @param {number} goalInstanceId - 인증할 목표 인스턴스 ID
 */
goalRouter.post(
  '/:goalInstanceId/validate/photo',
  imageUploader.single('photo'),
  goalController.validatePhoto
);

/**
 * @route POST /goals/:goalId/validate/team
 * @description 팀원 인증을 처리합니다.
 * @param {number} goalInstanceId - 인증할 목표 인스턴스 ID
 */
goalRouter.post(
  '/:goalInstanceId/validate/team',
  goalController.requestTeamValidation
);

module.exports = goalRouter;
