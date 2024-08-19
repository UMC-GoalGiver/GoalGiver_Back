const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const tokenRouter = require('./routes/token-route');

const goalRouter = require('./routes/goal-route');

const { setTestUser } = require('./middlewares/set-test-user');

const notificationRouter = require('./routes/notification-route');

dotenv.config();
const mypageRouter = require('./routes/mypage-route'); // 작성자: Minjae Han

//준구리 부분
const weeklyGoalRoutes = require('./routes/weekly-goal-routes');
const monthlyGoalRoutes = require('./routes/monthly-goal-routes.js');
const yearlyGoalRoutes = require('./routes/yearly-goal-routes.js');
const validationLocationAndTeamRoutes = require('./routes/validation-location-team-routes.js');
const teamGoalTimeAttackRoutes = require('./routes/timeattack-goal-routes.js');
const teamGoalTimeAttackValidationRoutes = require('./routes/timeattack-validation-routes.js');
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

app.use(setTestUser);

//로그인 라우터
app.use('/api/auth', authRoutes);

app.use('/api/friends', friendRoutes); //친구목록 라우터

app.use('/goals', goalRouter);

app.use('/mypage', mypageRouter); // 작성자: Minjae Han

app.use('/notification', notificationRouter);

app.use('/token', tokenRouter);

//준구리 부분
app.use('/goals/week', weeklyGoalRoutes); //주간 진행상황 라우터
app.use('/goals/month', monthlyGoalRoutes); //월간 진행상황 라우터
app.use('/goals/year', yearlyGoalRoutes); //연간 진행상황 라우터
app.use('/goals/location-team/list', validationLocationAndTeamRoutes); //위치인증, 팀원인증 인증내역 라우터
app.use('/goals/timeattack/progress', teamGoalTimeAttackRoutes); //팀목표 진행상황 라우터
app.use('/goals/timeattack/list', teamGoalTimeAttackValidationRoutes); //팀목표 인증내역 라우터
app.use('/goals/photo/list', validationPhotoRoutes); //사진 인증내역 라우터

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