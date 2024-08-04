const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
dotenv.config();

const db = require('../config/database.js');

//라우터 선언
const weeklyGoalRoutes = require('./routes/weekly-goal-routes');
const monthlyGoalRoutes = require('./routes/monthly-goal-routes.js');
const yearlyGoaoaRoutes = require('./routes/yearly-goal-routes.js');

const app = express();
app.set('port', process.env.PORT || 8000);

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
app.get('/', (req, res) => {
  res.send('Hello World!');
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

// 데이터베이스 연결 테스트
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT NOW()');
    res.json({ message: 'Database connected', time: rows[0]['NOW()'] });
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});


// app.listen(app.get('3000'), () => {
//   console.log(app.get('3000'), '번 포트에서 대기중');
// });
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
