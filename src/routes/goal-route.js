const express = require('express');

const { validatePhoto } = require('../controllers/goal-controller');
const { imageUploader } = require('../middlewares/image-upload');
// const { imageTesting } = require('../controllers/goal-controller');
const goalRouter = express.Router();

goalRouter.post(
  ':goalId/validate/photo',
  imageUploader.single('photo'),
  validatePhoto
);

// goalRouter.post(
//   '/:goalId/validate/photo/test',
//   imageUploader.single('photo'),
//   imageTesting
// );

module.exports = goalRouter;
