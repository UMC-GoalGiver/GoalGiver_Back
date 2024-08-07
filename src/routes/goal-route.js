const express = require('express');
const { acceptValidation } = require('../controllers/goal-controller');

const goalRouter = express.Router();

goalRouter.post('/:instanceId/validate/accept', acceptValidation);

module.exports = goalRouter;
