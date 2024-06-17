const express = require('express');
const {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updateMe,
} = require('../controllers/usersController');

const {
    signup,
    login,
    forgotPassword,
    resetPassword,
    updatePassword,
    protectRoute,
} = require('../controllers/authController');

const usersRouter = express.Router();

usersRouter.route('/signup').post(signup);
usersRouter.route('/login').post(login);
usersRouter.route('/').get(getAllUsers).post(createUser);
usersRouter.route('/forgotPassword').post(forgotPassword);
usersRouter.route('/updatePassword').patch(protectRoute, updatePassword);
usersRouter.route('/UpdateUserData').patch(protectRoute, updateMe);
usersRouter.route('/resetPassword/:token').patch(resetPassword);
usersRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = usersRouter;
