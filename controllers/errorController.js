const AppError = require('./../utilis/appError');

const handleCostErrorDB = (err) => {
  const message = `invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');

  const value = err.errmsg.match(/(?:"[^"]*"|^[^"]*$)/);

  const message = `Duplicate field value: ${value[0]}, Please use another value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data.${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJwtError = () =>
  new AppError('Invaild token ,Please Login again!', 401);

const handleJwtExpiredError = () =>
  new AppError('Token expired, Please login again', 401);

const sendErrorDev = (err, req, res) => {
  //*ApI
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  console.error('Error', err);
  //*rendered website
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong !',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //*ApI
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperation) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error('Error', err);

    return res.status(500).json({
      status: 'error',
      message: 'Something went very Wrong',
    });
  }
  //* rendered website
  if (err.isOperation) {
    //*Operational , trusted error:send message to the client
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong !',
      msg: err.message,
    });
  }
  //*Programming or other unknown errors
  console.error('Error', err);
  //* send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong !',
    msg: 'Please Try again leter.',
  });
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);
  //! with this four parameters express will automatically knows that this entire function are error handling function
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production ') {
    let error = Object.assign(err);

    if (error.name === 'CastError') error = handleCostErrorDB(error); //for get tour
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJwtError();
    if (error.name === 'TokenExpiredError') error = handleJwtExpiredError();

    sendErrorProd(error, req, res);
  }
};
