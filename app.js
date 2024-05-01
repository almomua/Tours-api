const express = require('express');

const morgan = require('morgan');

const app = express();

const toursRouter = require('./routes/toursRoutes');

const usersRouter = require('./routes/usersRoute');

const AppError = require('./utils/AppError');

const globalErrorHandler = require('./controllers/errorController');
// const dotenv = require('dotenv');
// dotenv.config({ path: '.env', override: true });
//middlewares//
app.use(express.json());
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// console.log(process.env);
//routes//
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
