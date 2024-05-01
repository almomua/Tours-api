const bcrypt = require('bcryptjs');

const User = require('../models/usersModel');

const AppError = require('../utils/AppError');

const asyncHandler = require('../utils/asyncHandler');

const jwt = require('jsonwebtoken');

const { promisify } = require('util');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

exports.signup = asyncHandler(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });
    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token: token,
        data: {
            user: {
                name: newUser.name,
                email: newUser.email,
            },
        },
    });
});

exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('missing username or password', 400));
    }

    const loggedUser = await User.findOne({ email }).select('+password');
    if (!loggedUser) {
        return next(new AppError('user not found', 401));
    }

    const login = await bcrypt.compare(password, loggedUser.password);
    if (!login) {
        return next(new AppError('password is incorrect', 401));
    }
    const token = signToken(loggedUser._id);
    return res.status(200).json({
        status: 'success',
        message: 'logged in successfully',
        token: token,
    });
});

exports.protectRoute = asyncHandler(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else {
        return next(
            new AppError('You are not authorized for this behavior ', 401),
        );
    }
    const decode = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET_KEY,
    );

    const freshUser = await User.findById(decode.id);
    if (!freshUser)
        return next(
            new AppError('the user for this token no longer exist', 401),
        );
    if (freshUser.changedPasswordAfter(decode.iat)) {
        return next(
            new AppError('user recently changed password , please log in', 401),
        );
    }
    req.user = freshUser;
    next();
});

exports.restrictTo = (...args) => {
    return (req, res, next) => {
        if (!args.includes(req.user.role)) {
            return next(
                new AppError('You are not authorized for this behavior ', 403),
            );
        }
        next();
    };
};
