const { acceptTeamValidation } = require('../services/goal-service');
const { StatusCodes } = require('http-status-codes');

/**
 * @function acceptValidation
 * @description 팀 목표 인증 수락을 처리하고 결과를 반환합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
exports.acceptValidation = async (req, res) => {
  try {
    const { instanceId } = req.params;
    const userId = req.user.id;

    const allAccepted = await acceptTeamValidation(instanceId, userId);

    if (allAccepted) {
      res
        .status(StatusCodes.OK)
        .json({ message: '모든 팀원이 인증을 수락하였습니다.' });
    } else {
      res.status(StatusCodes.OK).json({ message: '인증을 수락하였습니다.' });
    }
  } catch (err) {
    if (err.message === '이미 완료된 인증입니다.') {
      res.status(StatusCodes.CONFLICT).json({ message: err.message });
    } else {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: '인증 처리 중 오류 발생', error: err.message });
    }
  }
};
