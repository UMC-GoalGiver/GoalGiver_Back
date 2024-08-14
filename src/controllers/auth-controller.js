const {
  kakaoLogin,
  kakaoCallback,
  kakaoLogout,
  deleteKakaoAccount,
} = require('../services/auth-service');

exports.kakaoLogin = (req, res) => {
  const kakaoAuthURL = kakaoLogin();
  res.redirect(kakaoAuthURL);
};

exports.kakaoRedirect = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      throw new Error('인증 코드가 제공되지 않았습니다.');
    }
    const kakaoUser = await kakaoCallback(code);
    // 로그인 성공 후 클라이언트로 유저 정보를 반환
    res.json({ message: '회원가입 완료', user: kakaoUser });
  } catch (error) {
    next(error);
  }
};

// 닉네임 입력 폼을 렌더링하는 함수는 제거

exports.kakaoLogout = async (req, res, next) => {
  try {
    const { kakaoId } = req.body; // 클라이언트로부터 kakaoId를 받아옴
    await kakaoLogout(kakaoId);
    res.json({ message: '로그아웃 성공' });
  } catch (error) {
    next(error);
  }
};

exports.deleteKakaoAccount = async (req, res, next) => {
  try {
    const { kakaoId } = req.body; // 클라이언트로부터 kakaoId를 받아옴
    await deleteKakaoAccount(kakaoId);
    res.json({ message: '계정 삭제 성공' });
  } catch (error) {
    next(error);
  }
};
