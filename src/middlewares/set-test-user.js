exports.setTestUser = (req, res, next) => {
  // 임의의 사용자 정보를 설정합니다.
  req.user = {
    id: 1,
    nickname: 'testuser',
    role: 'user',
  };
  next();
};
