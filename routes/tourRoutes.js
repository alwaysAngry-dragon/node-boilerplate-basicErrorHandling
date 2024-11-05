const express = require('express');
const tourController = require('./../controllers//tourController');

const router = express.Router();

// router.param('tourID', tourController.checkID);

router
  .route('/')
  .get(tourController.getAllTours)
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
