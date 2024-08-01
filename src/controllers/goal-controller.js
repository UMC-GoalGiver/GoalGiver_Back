const { uploadPhotoAndValidate } = require('../services/goal-service');

// exports.imageTesting = async (req, res) => {
//   console.log(req.file);
//   res
//     .status(200)
//     .json({ message: 'Image uploaded successfully', file: req.file });
// };

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
