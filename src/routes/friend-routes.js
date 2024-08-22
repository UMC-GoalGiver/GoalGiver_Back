const express = require('express');
const router = express.Router();
const {
  getFriends,
  sendMessageToFriend,
  searchUser,
  addFriend,
  acceptFriendRequest,
  rejectFriendRequest,
  showFriends,
} = require('../controllers/friend-controller');

router.get('/api/talk/friends', getFriends);
router.post('/api/talk/friends/message/send', sendMessageToFriend);
router.get('/api/invite/accept', acceptInvite); //카카오톡 친구초대 수락
router.get('/user/search-user', searchUser);
router.post('/friends-request/:id', addFriend);
router.patch('/friend-requests/:id/accept', acceptFriendRequest);
router.patch('/friend-requests/:id/reject', rejectFriendRequest);
router.get('/friends/show', showFriends);

module.exports = router;
