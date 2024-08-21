const db = require('../../config/database');

// 공통된 쿼리 실행 함수
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error('Database query failed:', error);
    throw new Error('Database query failed');
  }
};

// 친구 요청 추가
exports.addFriendRequest = async (userId, friendId) => {
  const query = 'INSERT INTO friend_requests (user_id, friend_id) VALUES (?, ?)';
  await executeQuery(query, [userId, friendId]);
};

// 친구 요청 상태 업데이트
exports.updateFriendRequestStatus = async (requestId, status) => {
  const query = 'UPDATE friend_requests SET status = ? WHERE id = ?';
  await executeQuery(query, [status, requestId]);
};

// 친구 요청 목록 조회
exports.getFriendRequests = async (userId) => {
  const query = 'SELECT * FROM friend_requests WHERE user_id = ?';
  return executeQuery(query, [userId]);
};

// 친구 요청 조회
exports.findFriendRequest = async (userId, requestId) => {
  const query = 'SELECT * FROM friend_requests WHERE id = ? AND friend_id = ?';
  const results = await executeQuery(query, [requestId, userId]);
  return results[0];
};

// 친구 요청 삭제
exports.deleteFriendRequest = async (requestId) => {
  const query = 'DELETE FROM friend_requests WHERE id = ?';
  await executeQuery(query, [requestId]);
};
