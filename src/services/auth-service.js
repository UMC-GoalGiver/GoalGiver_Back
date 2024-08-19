const axios = require('axios');
const {
  findUserByKakaoId,
  createUser,
  updateUserTokens,
  deleteUserByKakaoId,
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
      // 유저가 존재하지 않는 경우, 기본 정보로 유저를 생성
      user = {
        kakaoId: id,
        email: kakao_account.email || '', // 이메일이 없을 경우 빈 문자열 설정
        nickname: `user_${id}`, // 기본 닉네임 생성
        profile_photo: kakao_account.profile?.profile_image_url || '', // 프로필 이미지가 없을 경우 빈 문자열 설정
        accessToken: access_token,
        refreshToken: refresh_token,
      };
      await createUser(user);
    } else {
      // 기존 유저가 존재할 경우 토큰 갱신
      await updateUserTokens(id, access_token, refresh_token);
    }

    return user;
  } catch (error) {
    console.error(
      '카카오 API 요청 실패:',
      error.response?.data || error.message
    );
    throw new Error('카카오 로그인 실패');
  }
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
  kakaoLogout,
  deleteKakaoAccount,
};
