const express = require('express');
const { saveTokenController } = require('../controllers/token-controller');

const tokenRouter = express.Router();

tokenRouter.post('/save-token', saveTokenController);

module.exports = tokenRouter;
