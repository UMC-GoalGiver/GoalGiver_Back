const pool = require('../../config/database');

exports.getGoalsByDateRange = async (week_start, week_end) => {
  const query =
    'select g.id, title, description, start_date, end_date, type, status, latitude, longitude,  validation_type, emoji, donation_organization_id, donation_amount, gi.date from goals g, goalinstances gi where g.id = gi.goal_id and start_date >= ? and end_date <= ?';

  const [rows] = await pool.execute(query, [week_start, week_end]);
  return rows;
};
