const express = require('express');
const {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
} = require('../controllers/toursController');
const { protectRoute, restrictTo } = require('../controllers/authController');

const toursRouter = express.Router();
// toursRouter.param('id' , checkID)
toursRouter.route('/monthly-plan/:year').get(getMonthlyPlan);
toursRouter.route('/tours-stats').get(getTourStats);
toursRouter.route('/').get(protectRoute, getAllTours).post(createTour);
toursRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);
toursRouter
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .put(updateTour)
    .delete(protectRoute, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = toursRouter;
