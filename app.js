const path = require('path'); //!section12

const express = require('express');

const morgan = require('morgan');
const AppError = require('./utilis/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRouter');
//const { status } = require('express/lib/response');
//const { nextTick } = require('process');
//const { loadavg } = require('os');
// Start express app
const app = express();

//!section 12
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//*****************************************************1-MIDDLEWARE************************* */
//creating our own middleware
//console.log(process.env.NODE_ENV);

//! 1-Global middleware

app.use(helmet()); //!Set Security HTTP headers

//!development login
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   next();
// });

const limiter = rateLimit({
  //!limit requests from same API
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from This IP, please try again in an hour!',
});
app.use('/api', limiter); //* to make this middleware work with only to /api

//!Body Parser ,reading date from body into req.body .Parse data from body

app.use(
  express.json({
    limit: '10Kb',
  })
);

app.use(express.urlencoded({ extended: true, limit: '10Kb' })); //! this middleware allow us to get data from url encoded form,extended true :allow us to pass some more complex data . used for get info from user form template lecture 194
app.use(cookieParser()); //!parse data from cookies

//! Data sanitization against NoSQL query injection "email": { "$gt":"" },
app.use(mongoSanitize());
//! Data sanitization against XSS
app.use(xss());

//! Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//!Serving  static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public'))); //!section12 for base.pug
//app.get('/', (req, res) => {
//  res
//    .status(200)
//    .json({ message: 'Hello from the serve side', app: 'natours' });
//});
//
//app.post('/', (req, res) => {
//  res.send('you can post to this URL');
//});

//*****************************************************2-route handles************************* */

//*****************************************************3-Route************************* */
//app.get('/api/v1/tours', getAllTours);
//app.post('/api/v1/tours', createTour);
//app.get('/api/v1/tours/:id', getTour);
//app.patch('/api/v1/tours/:id', updateTour);
//app.delete('/api/v1/tours/:id', deleteTour);

/*


app.route('/api/v1/users').get(getAllUsers).post(createUser);
app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);
  */

//! Test MiddleWare
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

//*Routes

app.use('/', viewRouter);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server `,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on this server `);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server `)); //! when we pass argument inside next express will leave other middleware and directly goes to error middleware
}); // star mean everything

app.use(globalErrorHandler);

//*****************************************************4-start the server************************* */
module.exports = app;
