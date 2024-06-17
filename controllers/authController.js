const bcrypt = require('bcryptjs');

const User = require('../models/usersModel');

const AppError = require('../utils/AppError');

const asyncHandler = require('../utils/asyncHandler');

const jwt = require('jsonwebtoken');

const { promisify } = require('util');

const sendEmail = require('../utils/email');

const crypto = require('crypto');

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

exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('user not found', 404));
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        await sendEmail({
            email: user.email,
            subject: 'reset your password',
            message: resetURL,
        });
        res.status(200).json({
            status: 'success',
            message: 'email sent successfully',
        });
    } catch (error) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError(error, 500));
    }
});
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    console.log(hashedToken);
    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
        return next(new AppError('token is invalid or expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpires = undefined;
    await user.save();
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        message: 'password reset successfully',
        token: token,
    });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    
    const login = await bcrypt.compare(req.body.password, user.password);
    if (!login) {
        return next(new AppError('password is incorrect', 401));
    }
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        message: 'password updated successfully',
        token: token,
    });
});
