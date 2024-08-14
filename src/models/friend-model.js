const db = require('../../config/database');

exports.getFriends = async (userId) => {
  const [rows] = await db.query('SELECT * FROM friends WHERE user_id = ?', [
    userId,
  ]);
  return rows;
};

exports.searchUser = async (username) => {
  const [rows] = await db.query('SELECT * FROM users WHERE username LIKE ?', [
    `%${username}%`,
  ]);
  return rows;
};

exports.addFriendRequest = async (userId, friendId) => {
  await db.query(
    'INSERT INTO friend_requests (user_id, friend_id) VALUES (?, ?)',
    [userId, friendId]
  );
};

exports.updateFriendRequestStatus = async (requestId, status) => {
  await db.query('UPDATE friend_requests SET status = ? WHERE id = ?', [
    status,
    requestId,
  ]);
};

exports.getFriendRequests = async (userId) => {
  const [rows] = await db.query(
    'SELECT * FROM friend_requests WHERE user_id = ?',
    [userId]
  );
  return rows;
};
