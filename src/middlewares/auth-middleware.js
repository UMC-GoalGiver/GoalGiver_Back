const setUser = (req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
  }
  next();
};

module.exports = {
  setUser,
};
