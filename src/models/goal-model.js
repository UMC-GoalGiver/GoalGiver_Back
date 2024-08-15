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
 */
exports.notifyTeamMembers = async (instanceId, user) => {
  const query =
    'SELECT user_id FROM team_members WHERE team_goal_id = (SELECT goal_id FROM goal_instances WHERE id = ?)';
  const [members] = await pool.query(query, [instanceId]);

  const goal = await this.getGoalByInstanceId(instanceId);
  const requesterName = user.nickname;

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
      const checkQuery = `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ?
                              AND JSON_EXTRACT(content, '$.goal.instance_id') = CAST(? AS JSON)`;
      const [existingNotifications] = await pool.execute(checkQuery, [
        member.user_id,
        instanceId,
      ]);

      if (existingNotifications[0].count > 0) {
        throw new Error('중복된 알림이 이미 존재합니다.');
      }
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
 * @returns {Promise<boolean>} 중복 여부
 */
exports.checkForExistingValidation = async (instanceId) => {
  const query =
    'SELECT COUNT(*) as count FROM goal_validation WHERE goal_instance_id = ? AND validated_at IS NOT NULL';
  const [rows] = await pool.execute(query, [instanceId]);

  return rows[0].count > 0; // 중복이 있으면 true, 없으면 false
};

/**
 * @function getGoalsByDateRange
 * @description 특정 날짜 범위 내의 목표 인스턴스를 조회합니다.
 * @param {string} week_start - 조회 시작 날짜 (YYYY-MM-DD)
 * @param {string} week_end - 조회 종료 날짜 (YYYY-MM-DD)
 * @returns {Promise<Array>} 목표 인스턴스 배열
 * @throws {Error} 데이터베이스 조회 에러
 */

exports.getGoalsByDateRange = async (userId, week_start, week_end) => {
  const query = `
    SELECT g.id as goal_id, gi.id as goal_instance_id, title, description, start_date, end_date, type, status,
    latitude, longitude, validation_type, emoji, donation_organization_id, donation_amount, gi.date
    FROM goals g
    JOIN goal_instances gi ON g.id = gi.goal_id
    WHERE g.user_id = ? AND gi.date >= ? AND gi.date <= ?
  `;

  try {
    const [rows] = await pool.execute(query, [userId, week_start, week_end]);
    return rows;
  } catch (err) {
    console.error('날짜 범위에 따른 에러: ', err);
    throw err;
  }
};

// 사용자 목표 조회 함수
exports.getUserGoals = async (userId) => {
  const query = `
    SELECT g.id, g.title, g.description, g.start_date, g.end_date, g.type, g.status,
          g.latitude, g.longitude, g.validation_type, g.emoji,
          g.donation_organization_id, g.donation_amount
    FROM goals g
    WHERE g.user_id = ?
  `;

  try {
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  } catch (err) {
    console.error('사용자 목표 조회 중 에러 발생: ', err);
    throw err;
  }
};

// 반복 데이터를 바탕으로 목표 인스턴스를 생성하는 함수
async function createGoalInstances(goalId, startDate, endDate, repeatData) {
  try {
    const instances = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (repeatData.repeatType === 'daily') {
      for (
        let date = new Date(start);
        date <= end;
        date.setDate(date.getDate() + (repeatData.intervalOfDays || 1))
      ) {
        instances.push([goalId, date.toISOString().split('T')[0]]);
      }
    } else if (repeatData.repeatType === 'weekly') {
      const daysOfWeek = repeatData.daysOfWeek || [];
      for (
        let date = new Date(start);
        date <= end;
        date.setDate(date.getDate() + 1)
      ) {
        if (
          daysOfWeek.includes(
            date.toLocaleString('en', { weekday: 'short' }).toLowerCase()
          )
        ) {
          instances.push([goalId, date.toISOString().split('T')[0]]);
        }
      }
    } else if (repeatData.repeatType === 'monthly') {
      for (
        let date = new Date(start);
        date <= end;
        date.setMonth(date.getMonth() + 1)
      ) {
        date.setDate(repeatData.dayOfMonth || date.getDate());
        instances.push([goalId, date.toISOString().split('T')[0]]);
      }
    }

    if (instances.length > 0) {
      const query = 'INSERT INTO Goal_Instances (goal_id, date) VALUES ?';
      await pool.query(query, [instances]);
    }
  } catch (error) {
    if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
      console.error('Lock wait timeout occurred. Retrying transaction...');
      return await createGoalInstances(goalId, startDate, endDate, repeatData);
    }
    throw error;
  }
}

// 개인 목표 생성 함수
exports.createPersonalGoal = async (goalData) => {
  const query = `
    INSERT INTO Goals (user_id, title, description, start_date, end_date, type, validation_type, latitude, longitude, emoji, donation_organization_id, donation_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    goalData.userId,
    goalData.title,
    goalData.description,
    goalData.startDate,
    goalData.endDate,
    goalData.type,
    goalData.validationType,
    goalData.latitude,
    goalData.longitude,
    goalData.emoji,
    goalData.donationOrganizationId,
    goalData.donationAmount,
  ];

  const [result] = await pool.execute(query, values);

  if (goalData.repeatType) {
    await createGoalInstances(
      result.insertId,
      goalData.startDate,
      goalData.endDate,
      goalData
    );
  }

  return { id: result.insertId, ...goalData };
};

// 팀 목표 생성 함수
exports.createTeamGoal = async (goalData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Goals 테이블에 목표 정보 삽입
    const [goalResult] = await connection.execute(
      `
      INSERT INTO Goals (user_id, title, description, start_date, end_date, type, validation_type, latitude, longitude, emoji, donation_organization_id, donation_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        goalData.userId,
        goalData.title,
        goalData.description,
        goalData.startDate,
        goalData.endDate,
        goalData.type,
        goalData.validationType,
        goalData.latitude,
        goalData.longitude,
        goalData.emoji,
        goalData.donationOrganizationId,
        goalData.donationAmount,
      ]
    );

    const goalId = goalResult.insertId;

    // Team_Goals 테이블에 추가 정보 삽입
    const [teamGoalResult] = await connection.execute(
      `
      INSERT INTO Team_Goals (goal_id, time_attack, start_time, end_time)
      VALUES (?, ?, ?, ?)
    `,
      [goalId, goalData.timeAttack, goalData.startTime, goalData.endTime]
    );

    // Team_Members 테이블에 팀원 정보 삽입
    for (const memberId of goalData.teamMemberIds) {
      await connection.execute(
        `
        INSERT INTO Team_Members (team_goal_id, user_id)
        VALUES (?, ?)
      `,
        [teamGoalResult.insertId, memberId]
      );
    }

    await connection.commit();

    // 트랜잭션 외부에서 인스턴스 생성
    if (goalData.repeatType) {
      await createGoalInstances(
        goalId,
        goalData.startDate,
        goalData.endDate,
        goalData
      );
    }

    return { id: goalId, ...goalData };
  } catch (err) {
    await connection.rollback();
    console.error('팀 목표 생성 중 에러 발생: ', err);
    throw err;
  } finally {
    connection.release();
  }
};

// 목표 반복 생성 함수
exports.createGoalRepeat = async (goalId, repeatData) => {
  const query = `
    INSERT INTO Goal_Repeats (goal_id, repeat_type, days_of_week, day_of_month, interval_of_days)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    goalId,
    repeatData.repeatType,
    repeatData.daysOfWeek ? repeatData.daysOfWeek.join(',') : null,
    repeatData.dayOfMonth || null,
    repeatData.intervalOfDays || null,
  ];

  await pool.execute(query, values);
};

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
