const { sendNotification } = require('../services/notification-service');

exports.sendNotificationController = async (req, res) => {
  try {
    const { tokens, notification, data } = req.body;

    const response = await sendNotification(tokens, notification, data);

    res.status(200).json({ message: '알림 전송 성공', data: response });
  } catch (err) {
    res.status(500).json({ message: '알림 전송 실패', error: err.message });
  }
};
