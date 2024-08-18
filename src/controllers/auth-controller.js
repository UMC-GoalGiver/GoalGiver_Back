const { kakaoLogin, kakaoCallback, kakaoLogout, deleteKakaoAccount } = require('../services/auth-service');
const { StatusCodes } = require('http-status-codes');

exports.kakaoLogin = (req, res) => {
  const kakaoAuthURL = kakaoLogin();
  res.redirect(kakaoAuthURL);
};

exports.kakaoRedirect = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: '인증 코드가 제공되지 않았습니다.' });
    }
    const kakaoUser = await kakaoCallback(code);
    // 로그인 성공 후 클라이언트로 유저 정보를 반환
    res.status(StatusCodes.OK).json({ message: '회원가입 완료', user: kakaoUser });
  } catch (error) {
    next(error);
  }
};

exports.kakaoLogout = async (req, res, next) => {
  try {
    const { kakaoId } = req.body; // 클라이언트로부터 kakaoId를 받아옴
    await kakaoLogout(kakaoId);
    res.status(StatusCodes.OK).json({ message: '로그아웃 성공' });
  } catch (error) {
    next(error);
  }
};

exports.deleteKakaoAccount = async (req, res, next) => {
  try {
    const { kakaoId } = req.body; // 클라이언트로부터 kakaoId를 받아옴
    await deleteKakaoAccount(kakaoId);
    res.status(StatusCodes.OK).json({ message: '계정 삭제 성공' });
  } catch (error) {
    next(error);
  }
};
