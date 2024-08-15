exports.setTestUser = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    req.user = { id: 1 }; // 테스트용 사용자 ID
  }
  next();
};
