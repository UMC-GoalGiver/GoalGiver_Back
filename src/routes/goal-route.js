const express = require('express');

const { validateLocation } = require('../controllers/goal-controller');

const goalRouter = express.Router();

goalRouter.post('/:goalId/validate/location', validateLocation);

module.exports = goalRouter;
