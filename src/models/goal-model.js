const pool = require('../../config/database');

/**
 * @function getGoalByInstanceId
 * @description 인스턴스 ID로 목표 정보를 조회합니다.
 * @param {number} instanceId - 조회할 목표 인스턴스 ID
 * @returns {Promise<Object>} 목표 정보 객체
 * @throws {Error} 데이터베이스 조회 에러
 */
exports.getGoalByInstanceId = async (instanceId) => {
  const query =
    'SELECT g.*, gi.id as instance_id FROM goals g JOIN goal_instances gi ON g.id = gi.goal_id WHERE gi.id = ?';
  const [rows] = await pool.execute(query, [instanceId]);

  if (rows.length === 0) {
    throw new Error('해당 목표를 찾을 수 없습니다.');
  }
  console.log(rows[0]);
  return rows[0];
};

/**
 * @function saveValidationResult
 * @description 목표 인증 결과를 저장합니다.
 * @param {number} instanceId - 목표 인스턴스 ID
 * @param {string} photoUrl - 인증 사진 URL
 */
exports.saveValidationResult = async (goalId, instanceId, photoUrl) => {
  const query =
    'insert into goal_validation (goal_id, goal_instance_id, validated_at, validation_data) values(?, ?, now(), ?)';
  await pool.execute(query, [goalId, instanceId, photoUrl]);
};

/**
 * @function notifyTeamMembers
 * @description 팀 목표 인증 요청을 팀원들에게 알립니다.
 * @param {number} instanceId - 목표 인스턴스 ID
 * @param {Object} user - 요청한 사용자 정보
 * @param {string} photoUrl - 인증 사진 URL
 */
exports.notifyTeamMembers = async (instanceId, user) => {
  const query =
    'SELECT user_id FROM team_members WHERE team_goal_id = (SELECT goal_id FROM goal_instances WHERE id = ?)';
  const [members] = await pool.query(query, [instanceId]);
  console.log('Members:', members); // 디버깅용 로그

  const goal = await this.getGoalByInstanceId(instanceId);
  const requesterName = user.nickname; // res.locals.user에서 가져온 사용자 정보

  for (const member of members) {
    if (member.user_id !== user.id) {
      const content = JSON.stringify({
        message: `${requesterName}님께서 '${goal.title}' 인증을 요청을 보냈습니다.`,
        goal: {
          goal_id: goal.id,
          instance_id: goal.instance_id,
          title: goal.title,
        },
      });

      try {
        const query =
          'INSERT INTO notifications (user_id, content) VALUES (?, ?)';
        await pool.query(query, [member.user_id, content]);
      } catch (error) {
        console.error('Error inserting notification:', error); // 에러 로그
      }
    }
  }
};

/**
 * @function initializeTeamValidation
 * @description 팀 목표의 인증을 초기화하고 팀원 정보를 삽입합니다.
 * @param {number} instanceId - 목표 인스턴스 ID
 * @param {number} requesterId - 요청자의 사용자 ID
 */
exports.initializeTeamValidation = async (instanceId, requesterId) => {
  const query =
    'SELECT user_id FROM team_members WHERE team_goal_id = (select goal_id from goal_instances where id = ?)';
  // 팀원 정보를 가져옵니다.
  const [members] = await pool.query(query, [instanceId]);

  // 팀원 정보가 없을 경우 오류를 반환합니다.
  if (members.length === 0) {
    throw new Error('팀원 정보를 찾을 수 없습니다.');
  }

  // 각 팀원에 대해 team_validation에 기본값을 삽입합니다.
  for (const member of members) {
    if (member.user_id !== requesterId) {
      const query =
        'INSERT INTO team_validation (validation_id, user_id) VALUES ((SELECT id FROM goal_validation WHERE goal_instance_id = ?), ?)';
      await pool.query(query, [instanceId, member.user_id]);
    }
  }
};

/**
 * @function checkForExistingValidation
 * @description 중복 인증 데이터를 확인합니다.
 * @param {number} instanceId - 목표 인스턴스 ID
 * @param {string} photoUrl - 인증 사진 URL
 * @returns {Promise<boolean>} 중복 여부
 */
exports.checkForExistingValidation = async (instanceId) => {
  const query =
    'SELECT COUNT(*) as count FROM goal_validation WHERE goal_instance_id = ? AND validated_at IS NOT NULL';
  const [rows] = await pool.execute(query, [instanceId]);

  return rows[0].count > 0; // 중복이 있으면 true, 없으면 false
};
