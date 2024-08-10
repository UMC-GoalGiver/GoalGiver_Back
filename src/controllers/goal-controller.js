const { acceptTeamValidation } = require('../services/goal-service');

/**
 * @function acceptValidation
 * @description 팀 목표 인증 수락을 처리하고 결과를 반환합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
exports.acceptValidation = async (req, res) => {
  try {
    const { instanceId } = req.params;
    const userId = res.locals.user.id;

    const allAccepted = await acceptTeamValidation(instanceId, userId);

    if (allAccepted) {
      res.status(200).json({ message: '모든 팀원이 인증을 수락하였습니다.' });
    } else {
      res.status(200).json({ message: '인증을 수락하였습니다.' });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: '인증 처리 중 오류 발생', error: err.message });
  }
};
