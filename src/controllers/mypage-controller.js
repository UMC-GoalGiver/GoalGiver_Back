// 작성자: Minjae Han

const { getUserProfile } = require('../services/mypage-service');
const { StatusCodes } = require('http-status-codes');

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await getUserProfile(userId);

    res.status(StatusCodes.OK).json(profile);
  } catch (err) {
    console.error('마이페이지 조회 API 에러: ', err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal Server Error' });
  }
};
