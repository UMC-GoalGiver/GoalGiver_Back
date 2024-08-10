const pool = require('../../config/database');

// FCM 토큰 저장 함수
exports.saveToken = async (userId, token) => {
  // 먼저 해당 사용자의 기존 토큰이 있는지 확인합니다.
  const [existingTokens] = await pool.query(
    'SELECT id FROM user_tokens WHERE user_id = ?',
    [userId]
  );

  if (existingTokens.length > 0) {
    // 기존 토큰이 있으면 해당 사용자 토큰을 업데이트합니다.
    await pool.query('UPDATE user_tokens SET token = ? WHERE user_id = ?', [
      token,
      userId,
    ]);
  } else {
    // 기존 토큰이 없으면 새로 삽입합니다.
    await pool.query('INSERT INTO user_tokens (user_id, token) VALUES (?, ?)', [
      userId,
      token,
    ]);
  }
};
