// 작성자: Minjae Han

const { getUserDonations } = require('../services/donation-service');
const { StatusCodes } = require('http-status-codes');

exports.getUserDonations = async (req, res) => {
  try {
    const userId = req.user.id;
    const donations = await getUserDonations(userId);

    res.status(StatusCodes.OK).json(donations);
  } catch (err) {
    console.error('기부 내역 조회 API 에러: ', err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal Server Error' });
  }
};
