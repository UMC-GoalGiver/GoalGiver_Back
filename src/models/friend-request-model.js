const { DataTypes } = require('sequelize');
const db = require('../../config/database');

const FriendRequest = db.define('FriendRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {  // requester_id
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'requester_id',
  },
  friendId: {  // requestee_id
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'requestee_id',
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'friend_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = FriendRequest;
