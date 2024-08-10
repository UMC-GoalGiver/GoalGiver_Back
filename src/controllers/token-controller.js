const { saveToken } = require('../services/token-service');

exports.saveTokenController = async (req, res) => {
  const userId = res.locals.user.id;
  const { token } = req.body;

  try {
    await saveToken(userId, token);
    res.status(200).json({ message: '토큰 저장 성공' });
  } catch (err) {
    res.status(500).json({ message: '토큰 저장 실패', error: err.message });
  }
};
