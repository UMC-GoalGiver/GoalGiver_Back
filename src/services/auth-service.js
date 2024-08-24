const axios = require('axios');
const {
  findUserByKakaoId,
  createUser,
  updateUserTokens,
  deleteUserByKakaoId,
  findUserByNickname,
  updateUserNickname,
} = require('../models/user-model');
require('dotenv').config();

// 클라이언트에서 받은 토큰을 통해 사용자 정보를 가져옴
const kakaoTokenLogin = async (accessToken, refreshToken) => {
  try {
    // 토큰을 이용해 사용자 정보를 가져옴
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { id, kakao_account } = userResponse.data;

    let user = await findUserByKakaoId(id);

    if (!user) {
      // 유저가 없으면 새로 생성
      await createUser({
        kakaoId: id,
        email: kakao_account.email || '',
        nickname: null,
        profileImage: kakao_account.profile?.profile_image_url || '',
        refreshToken: refreshToken,
      });

      user = await findUserByKakaoId(id);
    } else {
      // 기존 유저의 토큰 갱신
      await updateUserTokens(id, accessToken, refreshToken);
    }

    return {
      kakaoId: id,
      email: kakao_account.email || '',
      profileImage: kakao_account.profile?.profile_image_url || '',
      accessToken: accessToken,
      refreshToken: refreshToken,
      nickname: user.nickname,
    };
  } catch (error) {
    console.error('카카오 API 요청 실패:', error.response?.data || error.message);
    throw new Error('카카오 로그인 실패');
  }
};

module.exports = {
  kakaoTokenLogin,
  registerNickname,
  checkNicknameDuplicate,
  kakaoLogout,
  deleteKakaoAccount,
};
