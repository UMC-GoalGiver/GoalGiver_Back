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

// 반복 데이터를 바탕으로 목표 인스턴스를 생성하는 함수
async function createGoalInstances(goalId, startDate, endDate, repeatData) {
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
      date.setMonth(date.getMonth() + (repeatData.intervalOfDays || 1))
    ) {
      instances.push([goalId, date.toISOString().split('T')[0]]);
    }
  }

  if (instances.length > 0) {
    const query = 'INSERT INTO Goal_Instances (goal_id, date) VALUES ?';
    await pool.query(query, [instances]);
  }
}

// 기존의 createPersonalGoal 및 createTeamGoal 함수 수정
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

exports.createTeamGoal = async (goalData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

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

    const [teamGoalResult] = await connection.execute(
      `
      INSERT INTO Team_Goals (goal_id, time_attack, start_time, end_time)
      VALUES (?, ?, ?, ?)
    `,
      [goalId, goalData.timeAttack, goalData.startTime, goalData.endTime]
    );

    for (const memberId of goalData.teamMemberIds) {
      await connection.execute(
        `
        INSERT INTO Team_Members (team_goal_id, user_id)
        VALUES (?, ?)
      `,
        [teamGoalResult.insertId, memberId]
      );
    }

    if (goalData.repeatType) {
      await createGoalInstances(
        goalId,
        goalData.startDate,
        goalData.endDate,
        goalData
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
