const express = require('express');
const goalController = require('../controllers/goal-controller');

const goalRouter = express.Router();

/**
 * @route POST /:instanceId/validate/accept
 * @description 목표 인스턴스에 대한 인증 수락을 처리
 */
goalRouter.post(
  '/:instanceId/validate/accept',
  goalController.acceptValidation
);

module.exports = goalRouter;
