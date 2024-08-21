const pool = require('../../config/database');

const findUserByKakaoId = async (kakaoId) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE kakaoId = ?', [
    kakaoId,
  ]);
  return rows[0];
};

const createUser = async (userData) => {
  const { kakaoId, email, nickname, profileImage, refreshToken } = userData;
  const [result] = await pool.query(
    'INSERT INTO users (kakaoId, email, nickname, profile_photo, refreshToken) VALUES (?, ?, ?, ?, ?)',
    [kakaoId, email, nickname, profileImage, refreshToken]
  );
  return result.insertId;
};

const updateUserTokens = async (kakaoId, accessToken, refreshToken) => {
  await pool.query(
    'UPDATE users SET accessToken = ?, refreshToken = ? WHERE kakaoId = ?',
    [accessToken, refreshToken, kakaoId]
  );
};

const deleteUserByKakaoId = async (kakaoId) => {
  await pool.query('DELETE FROM users WHERE kakaoId = ?', [kakaoId]);
};

const findUserByNickname = async (nickname) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE nickname = ?', [
    nickname,
  ]);
  return rows[0];
};

const updateUserNickname = async (kakaoId, nickname) => {
  await pool.query('UPDATE users SET nickname = ? WHERE kakaoId = ?', [
    nickname,
    kakaoId,
  ]);
};

module.exports = {
  findUserByKakaoId,
  createUser,
  updateUserTokens,
  deleteUserByKakaoId,
  findUserByNickname,
  updateUserNickname,
};
