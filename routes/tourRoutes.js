const express = require('express');
const tourController = require('./../controllers//tourController');
const authController = require('./../controllers/authController');

const router = express.Router();

// router.param('tourID', tourController.checkID);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/topTours')
  .get(
    tourController.topRoutes,
    tourController.getAllTours
  );

router
  .route('/getTourStats')
  .get(tourController.getTourStats);

router
  .route('/getMonthlyPlay/:year')
  .get(tourController.getMonthlyPlan);

router
  .route('/:tourID')
  .get(tourController.getATour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
