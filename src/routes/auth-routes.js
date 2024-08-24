const express = require('express');
const router = express.Router();
const {
  kakaoTokenLogin,
  registerNickname,
  checkNicknameDuplicate,
  kakaoLogout,
  deleteKakaoAccount,
} = require('../controllers/auth-controller');

// 클라이언트에서 로그인 후 받은 토큰을 처리하는 엔드포인트
router.post('/auth/kakao-token', kakaoTokenLogin);
router.post('/register-nickname', registerNickname);
router.post('/check-nickname', checkNicknameDuplicate);
router.post('/logout/kakao', kakaoLogout);
router.post('/delete/kakao', deleteKakaoAccount);

module.exports = router;
