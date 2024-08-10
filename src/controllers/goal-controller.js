const { uploadPhotoAndValidate } = require('../services/goal-service');

/**
 * @function validatePhoto
 * @description 목표 사진 인증을 처리하고 결과를 반환합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
exports.validatePhoto = async (req, res) => {
  try {
    const result = await uploadPhotoAndValidate(req, res.locals.user);
    res.status(200).json({ message: '인증 성공', data: result });
  } catch (error) {
    res
      .status(500)
      .json({ message: '에러로 인한 인증 실패', error: error.message });
  }
};
