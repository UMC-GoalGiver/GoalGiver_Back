const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

const goalRouter = require('./routes/goal-route');

dotenv.config();
const { setTestUser } = require('./middlewares/set-test-user');
const mypageRouter = require('./routes/mypage-route'); // 작성자: Minjae Han

const app = express();
app.set('port', process.env.PORT || 3000);


const db = require('../config/database.js');

const weeklyGoalRoutes = require('./routes/weekly-goal-routes');
const monthlyGoalRoutes = require('./routes/monthly-goal-routes.js');
const yearlyGoaoaRoutes = require('./routes/yearly-goal-routes.js');



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

app.use('/goals', goalRouter);

app.use('/mypage', mypageRouter); // 작성자: Minjae Han

app.use('/', (req, res) => {
  res.send('아무것도 없슴');
});


//라우터
app.use('/goals', weeklyGoalRoutes);
app.use('/goals', monthlyGoalRoutes);
app.use('/goals', yearlyGoaoaRoutes);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});


app.listen(app.get('port'), () => {
  console.log(`Server is running on http://localhost:${app.get('port')}/`);
});
// 데이터베이스 연결 테스트
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT NOW()');
    res.json({ message: 'Database connected', time: rows[0]['NOW()'] });
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});


