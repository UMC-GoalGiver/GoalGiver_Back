const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
//const tokenRouter = require('./routes/token-route');

//const goalRouter = require('./routes/goal-route');

//const { setTestUser } = require('./middlewares/set-test-user');

//const notificationRouter = require('./routes/notification-route');

dotenv.config();
//const mypageRouter = require('./routes/mypage-route'); // 작성자: Minjae Han

//준구리 부분
const validationPhotoRoutes = require('./routes/validation-photo-routes.js');

const app = express();
app.set('port', process.env.PORT || 3000);

if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');
  app.use(morgan('combined'));
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    })
  );
} else {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//app.use(setTestUser);

//app.use('/goals', goalRouter);

//app.use('/mypage', mypageRouter); // 작성자: Minjae Han

//app.use('/notification', notificationRouter);

//app.use('/token', tokenRouter);

//준구리 부분
app.use('/goals/photo/list', validationPhotoRoutes);


app.use('/', (req, res) => {
  res.send('아무것도 없슴');
});

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.listen(app.get('port'), () => {
  console.log(`Server is running on http://localhost:${app.get('port')}/`);
});