const tokenModel = require('../models/token-model');

exports.saveToken = async (userId, token) => {
  try {
    await tokenModel.saveToken(userId, token);
  } catch (error) {
    throw new Error('토큰 저장 중 오류 발생: ' + error.message);
  }
};
