const AppError = require('../utils/AppError');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        //Programming or other unknown error , don't leak error details
    } else {
        console.error('Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong',
        });
    }
};

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path} : ${err.value}`;
    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError('invalid token , please log in again !', 401);

const handleJWTExpireError = () => new AppError('token has expired', 401);

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        let error = { ...err };
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) {
            const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
            const message = `Duplicate field value: ${value}. Please use another value`;
            error = new AppError(message, 400);
        }
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((el) => el.message);
            const message = `Invalid input data. ${errors.join('. ')}`;
            error = new AppError(message, 400);
        }
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpireError();

        sendErrorProd(error, res);
    }
};
