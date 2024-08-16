const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME, // Ensure this is correctly set
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.getConnection()
  .then(conn => {
    console.log('Connected to the database');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.stack);
  });

module.exports = {
  query: (text, params) => pool.execute(text, params),
};

