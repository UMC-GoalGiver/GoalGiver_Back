const express = require('express');
const router = express.Router();
const {
  kakaoLogin,
  kakaoRedirect,
  kakaoLogout,
  deleteKakaoAccount,
} = require('../controllers/auth-controller');

router.get('/login/kakao', kakaoLogin);
router.get('/login/kakao-redirect', kakaoRedirect);
//router.post('/register-nickname', registerNickname); // 닉네임 설정 엔드포인트 추가
router.post('/logout/kakao', kakaoLogout);
router.post('/delete/kakao', deleteKakaoAccount);

module.exports = router;
