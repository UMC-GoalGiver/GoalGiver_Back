// 작성자: Minjae Han

const { pool } = require('../../config/database');

exports.getUserProfile = async (userId) => {
  const [user] = await pool.query(
    `
    SELECT id AS userId, nickname, level, profile_photo AS profilePhoto, points, donation_points AS donationPoints
    FROM Users
    WHERE id = ?
  `,
    [userId]
  );

  const [badges] = await pool.query(
    `
    SELECT ub.badge_name AS name
    FROM User_Badges ub
    WHERE ub.user_id = ?
  `,
    [userId]
  );

  return {
    ...user[0],
    badges,
  };
};
