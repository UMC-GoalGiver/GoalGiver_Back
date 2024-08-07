const { acceptTeamValidation } = require('../services/goal-service');

exports.acceptValidation = async (req, res) => {
  try {
    const { validationId } = req.params;
    const userId = res.locals.user.id;

    const allAccepted = await acceptTeamValidation(validationId, userId);

    if (allAccepted) {
      res.status(200).json({ message: '모든 팀원이 인증을 수락하였습니다.' });
    } else {
      res.status(400).json({ message: '인증을 수락하였습니다.' });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: '인증 처리 중 오류 발생', error: err.message });
  }
};
