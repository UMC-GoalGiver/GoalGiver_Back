const pool = require('../../config/database');

exports.getGoalById = async (goalId) => {
  const [rows] = pool.query('select * from goals where id = ?', [goalId]);
  return rows[0];
};

exports.saveValidationResult = async (goalId, userId, photoUrl) => {
  await pool.query(
    'insert into goal_validations (goal_id, user_id, validation_data values(?, ?, ?)',
    [goalId, userId, photoUrl]
  );
};

exports.notifyTeamMembers = async (goalId, userId, photoUrl) => {
  const [members] = await pool.query(
    'select user_id from team_members where team_goal_id = ?',
    [goalId]
  );
  const goal = await this.getGoalById(goalId);
  const requester = await pool.query('select name from user where id = ?', [
    userId,
  ]);
  for (const member of members) {
    if (member.user_id !== userId) {
      const content = JSON.stringify({
        message: `${requester}님께서 '${goal.title}' 인증을 요청을 보냈습니다.`,
        photoUrl: photoUrl,
        goal: {
          id: goal.id,
          title: goal.title,
        },
      });
      await pool.query(
        'insert into notifications (user_id, content) values (?, ?)',
        [member.user_id, content]
      );
    }
  }
};
