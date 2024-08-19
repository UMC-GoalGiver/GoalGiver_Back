const {
  getFriends,
  sendMessageToFriend,
  searchUser,
  addFriend,
  acceptFriendRequest,
  rejectFriendRequest,
  showFriends,
} = require('../services/friend-service');

// 카카오톡 친구 목록 가져오기
exports.getFriends = async (req, res, next) => {
  try {
    const friends = await getFriends(req.user.kakaoToken);
    res.status(200).json(friends);
  } catch (error) {
    next(error);
  }
};

// 친구 신청 카톡 보내기
exports.sendMessageToFriend = async (req, res, next) => {
  try {
    const { friendId, message } = req.body;
    await sendMessageToFriend(req.user.kakaoToken, friendId, message);
    res.status(200).json({ message: '메시지 전송 성공' });
  } catch (error) {
    next(error);
  }
};

// 앱 내 사용자 검색
exports.searchUser = async (req, res, next) => {
  try {
    const users = await searchUser(req.query.keyword);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// 앱 내 친구 신청
exports.addFriend = async (req, res, next) => {
  try {
    const friend = await addFriend(req.user.id, req.params.id);
    res.status(201).json(friend);
  } catch (error) {
    next(error);
  }
};

// 친구 요청 수락
exports.acceptFriendRequest = async (req, res, next) => {
  try {
    await acceptFriendRequest(req.user.id, req.params.id);
    res.status(200).json({ message: '친구 요청 수락 성공' });
  } catch (error) {
    next(error);
  }
};

// 친구 요청 거절
exports.rejectFriendRequest = async (req, res, next) => {
  try {
    await rejectFriendRequest(req.user.id, req.params.id);
    res.status(200).json({ message: '친구 요청 거절 성공' });
  } catch (error) {
    next(error);
  }
};

// 친구 목록 조회
exports.showFriends = async (req, res, next) => {
  try {
    const friends = await showFriends(req.user.id);
    res.status(200).json(friends);
  } catch (error) {
    next(error);
  }
};
