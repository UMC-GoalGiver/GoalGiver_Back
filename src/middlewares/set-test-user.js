exports.setTestUser = (req, res, next) => {
  // 임의의 사용자 정보를 설정합니다.
  res.locals.user = {
    id: 2,
    nickname: 'teammate',
    role: 'user',
  };
  next();
};
