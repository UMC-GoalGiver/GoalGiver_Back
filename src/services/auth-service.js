const axios = require('axios');
const {
  findUserByKakaoId,
  createUser,
  updateUserTokens,
  deleteUserByKakaoId,
  findUserByNickname,
} = require('../models/user-model');
require('dotenv').config();

// 카카오 로그인 URL 생성
const kakaoLogin = () => {
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}`;
  return kakaoAuthURL;
};

// 카카오 로그인 콜백 처리
const kakaoCallback = async (code) => {
  try {
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.KAKAO_CLIENT_ID,
          redirect_uri: process.env.KAKAO_REDIRECT_URI,
          code: code,
          client_secret: process.env.KAKAO_CLIENT_SECRET,
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id, kakao_account } = userResponse.data;

    let user = await findUserByKakaoId(id);

    if (!user) {
      await createUser({
        kakaoId: id,
        email: kakao_account.email || '',
        nickname: '',
        profileImage: kakao_account.profile?.profile_image_url || '',
        refreshToken: refresh_token,
      });
      
      user = await findUserByKakaoId(id);
    } else {
      // 기존 유저의 토큰 갱신
      await updateUserTokens(id, access_token, refresh_token);
    }

    return {
      kakaoId: id,
      email: kakao_account.email || '',
      profileImage: kakao_account.profile?.profile_image_url || '',
      accessToken: access_token,
      refreshToken: refresh_token,
      nickname: user.nickname,
    };

  } catch (error) {
    console.error(
      '카카오 API 요청 실패:',
      error.response?.data || error.message
    );
    throw new Error('카카오 로그인 실패');
  }
};

// 닉네임 설정 및 중복 확인
const registerNickname = async (kakaoId, nickname) => {
  const existingUser = await findUserByNickname(nickname);
  if (existingUser) {
    throw new Error('중복된 닉네임');
  }
  await updateUserNickname(kakaoId, nickname);

  return { message: '닉네임 등록 성공' };
};

// 로그아웃
const kakaoLogout = async (kakaoId) => {
  const user = await findUserByKakaoId(kakaoId);

  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }

  try {
    await axios.post('https://kapi.kakao.com/v1/user/logout', null, {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    });

    return true; // 로그아웃 성공
  } catch (error) {
    console.error(
      '카카오 로그아웃 실패:',
      error.response?.data || error.message
    );
    throw new Error('카카오 로그아웃 실패');
  }
};

// 계정 삭제
const deleteKakaoAccount = async (kakaoId) => {
  const user = await findUserByKakaoId(kakaoId);

  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }

  try {
    await axios.post('https://kapi.kakao.com/v1/user/unlink', null, {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    });

    await deleteUserByKakaoId(kakaoId);
    return true; // 계정 삭제 성공
  } catch (error) {
    console.error(
      '카카오 계정 삭제 실패:',
      error.response?.data || error.message
    );
    throw new Error('카카오 계정 삭제 실패');
  }
};

module.exports = {
  kakaoLogin,
  kakaoCallback,
  registerNickname, // 추가된 부분
  kakaoLogout,
  deleteKakaoAccount,
};