const express = require('express');
const {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
} = require('../controllers/usersController');

const { signup, login , forgotPassword , resetPassword } = require('../controllers/authController');

const usersRouter = express.Router();

usersRouter.route('/signup').post(signup);
usersRouter.route('/login').post(login);
usersRouter.route('/').get(getAllUsers).post(createUser);
usersRouter.route('/forgotPassword').post(forgotPassword);
usersRouter.route('/resetPassword/:token').post(resetPassword);
usersRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);


module.exports = usersRouter;
