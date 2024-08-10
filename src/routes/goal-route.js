const express = require('express');
const {
  sendNotificationController,
} = require('../controllers/notification-controller');

const notificationRouter = express.Router();

notificationRouter.post('/send-notification', sendNotificationController);

module.exports = notificationRouter;
