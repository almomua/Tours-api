const Tour = require('../models/toursModel');
const APIFeatures = require('../utils/apiFeatuers');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-rating,price';
    req.query.fields = 'name,price,rating,summary,difficulty';
    next();
};

exports.getAllTours = asyncHandler(async (req, res) => {
    // let queryObj = { ...req.query };
    // const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // excludeFields.forEach((el) => delete queryObj[el]);

    // // Advance Filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(
    //     /\b(gte|gt|lte|lt)\b/g,
    //     (match) => `$${match}`,
    // );
    // queryObj = JSON.parse(queryStr);
    // let query = Tour.find(queryObj);
    // // Sorting
    // if (req.query.sort) {
    //     const sortBy = req.query.sort.split(',').join(' ');
    //     query = query.sort(sortBy);
    // } else {
    //     query = query.sort('-createdAt');
    // }
    // // Field limiting
    // if (req.query.fields) {
    //     const fields = req.query.fields.split(',').join(' ');
    //     query = query.select(fields);
    // } else {
    //     query = query.select('-__v');
    // }
    // // Pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);
    // if (req.query.page) {
    //     const numTours = await Tour.countDocuments();
    //     if (skip >= numTours) throw new Error('This page does not exist');
    // }
    // execute query
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query;

    // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours,
        },
    });
});
exports.getTour = asyncHandler(async (req, res) => {
    const id = req.params.id;

    // const tour = await Tour.find({_id:id});
    const tour = await Tour.findById(id);
    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }
    res.status(200).json({ status: 'success', data: tour });
});
exports.createTour = asyncHandler(async (req, res) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ message: 'success', data: newTour });
});

exports.updateTour = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }
    res.status(200).json({ status: 'success', data: tour });
});
exports.deleteTour = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const tour = await Tour.findByIdAndDelete(id);
    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }
    res.status(204).json({ status: 'success', data: null });
});
exports.getTourStats = asyncHandler(async (req, res) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: 1 },
        },
    ]);
    res.status(200).json({ status: 'success', data: stats });
});

exports.getMonthlyPlan = asyncHandler(async (req, res) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            $project: { _id: 0 },
        },
        {
            $sort: { numTourStarts: -1 },
        },
    ]);
    res.status(200).json({ status: 'success', data: plan });
});
