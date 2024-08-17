const axios = require('axios');
const { Op } = require('sequelize');
const User = require('../models/user-model');
const FriendRequest = require('../models/friend-request-model');
const Friend = require('../models/friend-model');

// 카카오톡 친구 목록 가져오기
exports.getFriends = async (kakaoToken) => {
  const response = await axios.get(
    'https://kapi.kakao.com/v1/api/talk/friends',
    {
      headers: {
        Authorization: `Bearer ${kakaoToken}`,
      },
    }
  );
  return response.data;
};

// 친구에게 메시지 보내기
exports.sendMessageToFriend = async (kakaoToken, friendId, message) => {
  await axios.post(
    'https://kapi.kakao.com/v1/api/talk/friends/message/send',
    {
      template_object: {
        object_type: 'text',
        text: message,
        link: {
          web_url: 'https://developers.kakao.com',
          mobile_web_url: 'https://developers.kakao.com',
        },
      },
      receiver_uuids: [friendId],
    },
    {
      headers: {
        Authorization: `Bearer ${kakaoToken}`,
      },
    }
  );
};

// 앱 내 사용자 검색
exports.searchUser = async (keyword) => {
  return User.findAll({ where: { username: { [Op.like]: `%${keyword}%` } } });
};

// 앱 내 친구 신청
exports.addFriend = async (userId, friendId) => {
  const friendRequest = await FriendRequest.create({ userId, friendId });
  return friendRequest;
};

// 친구 요청 수락
exports.acceptFriendRequest = async (userId, requestId) => {
  const request = await FriendRequest.findOne({
    where: { id: requestId, friendId: userId },
  });
  if (request) {
    await Friend.create({ userId: request.userId, friendId: request.friendId });
    await request.destroy();
  }
};

// 친구 요청 거절
exports.rejectFriendRequest = async (userId, requestId) => {
  const request = await FriendRequest.findOne({
    where: { id: requestId, friendId: userId },
  });
  if (request) {
    await request.destroy();
  }
};

// 친구 목록 조회
exports.showFriends = async (userId) => {
  return Friend.findAll({ where: { userId } });
};
