const pool = require('../../config/database');

exports.getGoalsByDateRange = async (week_start, week_end) => {
  const query =
    'select g.id as goal_id, gi.id as goal_instance_id, title, description, start_date, end_date, type, status, latitude, longitude,  validation_type, emoji, donation_organization_id, donation_amount, gi.date from goals g, goalinstances gi where g.id = gi.goal_id and start_date >= ? and end_date <= ?';

  try {
    const [rows] = await pool.execute(query, [week_start, week_end]);
    return rows;
  } catch (err) {
    console.error('날짜 범위에 따른 에러: ', err);
    throw err;
  }
};

// 작성자: Minjae Han

exports.getUserGoals = async (userId) => {
  const query = `
    SELECT g.id, g.title, g.description, g.start_date, g.end_date, g.type, g.status,
           g.latitude, g.longitude, g.validation_type, g.emoji,
           g.donation_organization_id, g.donation_amount
    FROM goals g
    WHERE g.user_id = ?
  `;

  try {
    // SQL 인젝션 방지를 위해 prepared statements 사용
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  } catch (err) {
    console.error('사용자 목표 조회 중 에러 발생: ', err);
    throw err;
  }
};

// 작성자: Minjae Han

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
  return { id: result.insertId, ...goalData };
};

exports.createTeamGoal = async (goalData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Goals 테이블에 기본 목표 정보 삽입
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
    return { id: goalId, ...goalData };
  } catch (err) {
    await connection.rollback();
    console.error('팀 목표 생성 중 에러 발생: ', err);
    throw err;
  } finally {
    connection.release();
  }
};

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
