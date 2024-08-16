// notification-service.js
const admin = require('../../config/firebase');

/**
 * FCM을 통해 알림 전송
 * @param {Array<string>} tokens - 알림을 보낼 기기의 FCM 토큰 목록
 * @param {Object} notification - 알림 제목과 본문
 * @param {Object} data - 추가 데이터
 * @returns {Promise}
 */
exports.sendNotification = async (tokens, notification, data = {}) => {
  try {
    const message = {
      notification,
      data,
      tokens,
    };
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (err) {
    console.error('Error sending message:', err);
    throw err;
  }
};
