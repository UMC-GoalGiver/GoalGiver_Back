const express = require('express');

const { validatePhoto } = require('../controllers/goal-controller');

const goalRouter = express.Router();

goalRouter.get('/:goalId/validate/photo', validatePhoto);

module.exports = goalRouter;
