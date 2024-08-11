// 작성자: Minjae Han

const { pool } = require('../../config/database');

exports.getUserDonations = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT d.donation_date AS date, d.amount, o.name AS organization
    FROM Donations d
    JOIN Donation_Organizations o ON d.donation_organization_id = o.id
    WHERE d.user_id = ?
    ORDER BY d.donation_date DESC
  `,
    [userId]
  );

  return rows;
};
