const express = require('express');

const goalController = require('../controllers/goal-controller');
const { imageUploader } = require('../middlewares/image-upload');

const goalRouter = express.Router();

/**
 * @route POST /api/goals/:goalId/validate/photo
 * @description 목표 사진 인증을 처리합니다.
 * @param {string} goalId - 인증할 목표 ID
 */
goalRouter.post(
  '/:goalInstanceId/validate/photo',
  imageUploader.single('photo'),
  goalController.validatePhoto
);

module.exports = goalRouter;
