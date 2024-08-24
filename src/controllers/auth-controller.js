const { kakaoTokenLogin, registerNickname, checkNicknameDuplicate, kakaoLogout, deleteKakaoAccount } = require('../services/auth-service');
const { StatusCodes } = require('http-status-codes');

// 클라이언트에서 받은 토큰을 서버에서 처리
exports.kakaoTokenLogin = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.body;
    if (!accessToken || !refreshToken) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: '토큰이 제공되지 않았습니다.' });
    }
    const kakaoUser = await kakaoTokenLogin(accessToken, refreshToken);
    res.status(StatusCodes.OK).json({ message: '로그인 성공', user: kakaoUser });
  } catch (error) {
    next(error);
  }
};
