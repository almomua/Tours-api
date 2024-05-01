const validator = require('validator');

const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'name is required'],
        },
        email: {
            type: String,
            required: [true, 'email is required'],
            unique: true,
            lowercase: true,
            validate: {
                validator: validator.isEmail,
                message: 'this email is not valid',
            },
        },
        photo: {
            type: String,
        },
        role :{
            type : String,
            enum : ['user' , 'guide' , 'lead-guide' , 'admin'],
            default : 'user'

        },
        password: {
            type: String,
            required: [true, 'password is required'],
            minlength: 8,
            select: false,
        },
        passwordConfirm: {
            type: String,
            required: [true, 'password Confirmation is required'],
            // this only works on user.save() or users.create() in the controller
            validate: {
                validator: function (element) {
                    return element === this.password;
                },
                message: 'passwords are not the same',
            },
        },
        passwordCreatedAt: Date,
    },
    { versionKey: false },
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordCreatedAt) {
        const changedTimeStamp = parseInt(
            this.passwordCreatedAt.getTime() / 1000,
            10,
        );
        return JWTTimeStamp < changedTimeStamp;
    }
    return false;
};

const User = mongoose.model('users', userSchema);
module.exports = User;
