const express = require('express');

const goalController = require('../controllers/goal-controller');

const goalRouter = express.Router();

goalRouter.post(
  '/:instanceId/validate/location',
  goalController.validateLocation
);

module.exports = goalRouter;
