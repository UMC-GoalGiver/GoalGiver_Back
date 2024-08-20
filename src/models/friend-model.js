const { DataTypes } = require('sequelize');
const db = require('../../config/database');

const Friend = db.define('Friend', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {  // user_id
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  friendId: {  // friend_id
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'friend_id',
  },
}, {
  tableName: 'friends',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Friend;
