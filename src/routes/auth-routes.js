const express = require('express');
const router = express.Router();
const {
  kakaoLogin,
  kakaoRedirect,
  kakaoLogout,
  deleteKakaoAccount,
  registerNickname,
} = require('../controllers/auth-controller');

router.get('/login/kakao', kakaoLogin);
router.get('/login/kakao-redirect', kakaoRedirect);
router.post('/register-nickname', registerNickname); 
router.post('/logout/kakao', kakaoLogout);
router.post('/delete/kakao', deleteKakaoAccount);

module.exports = router;
