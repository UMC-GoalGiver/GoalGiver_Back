const pool = require('../../config/database');

/**
 * @function getGoalByInstanceId
 * @description 인스턴스 ID로 목표 정보를 조회합니다.
 * @param {number} instanceId - 조회할 목표 인스턴스 ID
 * @returns {Promise<Object>} 목표 정보 객체
 * @throws {Error} 데이터베이스 조회 에러
 */
exports.getGoalByInstanceId = async (instanceId) => {
  const [rows] = await pool.query(
    'SELECT g.*, gi.id as instance_id FROM goals g JOIN goal_instances gi ON g.id = gi.goal_id WHERE gi.id = ?',
    [instanceId]
  );

  if (rows.length === 0) {
    throw new Error('해당 목표를 찾을 수 없습니다.');
  }
  console.log(rows[0]);
  return rows[0];
};

exports.isValidationComplete = async (instanceId) => {
  const query =
    'select 1 from goal_validation where goal_instance_id = ? and validated_at is not null';
  const [rows] = await pool.execute(query, [instanceId]);

  return rows.length > 0;
};

/**
 * @function insertGoalValidation
 * @description 새로운 목표 인증 레코드를 삽입합니다.
 * @param {number} goalId - 목표 ID
 * @param {number} instanceId - 목표 인스턴스 ID
 * @param {number} latitude - 인증된 위도
 * @param {number} longitude - 인증된 경도
 * @returns {Promise<void>}
 */
exports.insertGoalValidation = async (
  goalId,
  instance_id,
  latitude,
  longitude,
  validatedAt
) => {
  await pool.query(
    'insert into goal_validation (goal_id, goal_instance_id, validated_at, validation_data) values (?, ?, ?, ?)',
    [goalId, instance_id, validatedAt, JSON.stringify({ latitude, longitude })]
  );
};
