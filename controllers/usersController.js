const fs = require('fs');

const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const User = require('../models/usersModel');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    obj.map((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);
exports.getAllUsers = (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours,
        },
    });
};
exports.getUser = (req, res) => {
    const id = +req.params.id;
    if (id > tours.length)
        return res.status(404).json({ status: 'fali', err: 'invalid id' });
    tour = tours.find((element) => element.id === id);
    res.status(200).json({ status: 'success', data: tour });
};
exports.createUser = (req, res) => {
    const newID = tours.at(-1).id + 1;
    const newTour = { id: newID, ...req.body };
    // console.log(newTour);
    tours.push(newTour);
    fs.writeFile(
        `./dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err) => {
            if (err)
                return res.status(400).json({ message: 'failure', err: err });
        },
    );
    res.status(201).json({ message: 'success', data: newTour });
};
exports.updateUser = (req, res) => {
    const id = +req.params.id;
    if (id > tours.length)
        return res.status(404).json({ status: 'fali', err: 'invalid id' });
    tour = tours.find((element) => element.id === id);
    tour = { ...tour, ...req.body };
    res.status(200).json({ status: 'success', data: tour });
};
exports.deleteUser = (req, res) => {
    const id = +req.params.id;
    if (id > tours.length)
        return res.status(404).json({ status: 'fali', err: 'invalid id' });
    tour = tours.find((element) => element.id === id);
    tours.splice(tours.indexOf(tour), 1);
    res.status(200).json({ status: 'success', data: tour });
};

exports.updateMe = asyncHandler(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'this route is not for password updates, please use /updatePassword',
                400,
            ),
        );
    }
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        },
    );
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});
