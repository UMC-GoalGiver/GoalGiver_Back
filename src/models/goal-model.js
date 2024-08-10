const pool = require('../../config/database');

/**
 * @function getGoalById
 * @description 목표 ID로 목표 정보를 조회합니다.
 * @param {number} goalId - 조회할 목표 ID
 * @returns {Promise<Object>} 목표 정보 객체
 * @throws {Error} 데이터베이스 조회 에러
 */
exports.getGoalById = async (goalId) => {
  const [rows] = await pool.query('select * from goals where id = ?', [goalId]);
  return rows[0];
};

/**
 * @function saveValidationResult
 * @description 목표 인증 결과를 저장합니다.
 * @param {number} goalId - 목표 ID
 * @param {string} photoUrl - 인증 사진 URL
 */
exports.saveValidationResult = async (goalId, photoUrl) => {
  await pool.query(
    'insert into goal_validation (goal_id, validation_data) values(?, ?)',
    [goalId, photoUrl]
  );
};

/**
 * @function notifyTeamMembers
 * @description 팀 목표 인증 요청을 팀원들에게 알립니다.
 * @param {number} goalId - 목표 ID
 * @param {Object} user - 요청한 사용자 정보
 * @param {string} photoUrl - 인증 사진 URL
 */
exports.notifyTeamMembers = async (goalId, user, photoUrl) => {
  const [members] = await pool.query(
    'select user_id from team_members where team_goal_id = ?',
    [goalId]
  );
  console.log('Members:', members); // 디버깅용 로그

  const goal = await this.getGoalById(goalId);
  const requesterName = user.nickname; // res.locals.user에서 가져온 사용자 정보

  for (const member of members) {
    if (member.user_id !== user.id) {
      const content = JSON.stringify({
        message: `${requesterName}님께서 '${goal.title}' 인증을 요청을 보냈습니다.`,
        photoUrl: photoUrl,
        goal: {
          id: goal.id,
          title: goal.title,
        },
      });
      console.log('Notification Content:', content); // 디버깅용 로그
      try {
        await pool.query(
          'INSERT INTO notifications (user_id, content) VALUES (?, ?)',
          [member.user_id, content]
        );
        console.log(`Notification inserted for user ${member.user_id}`); // 성공 로그
      } catch (error) {
        console.error('Error inserting notification:', error); // 에러 로그
      }
    }
  }
};
