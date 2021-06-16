const router = require('express').Router();
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');

// router.param('id', tourController.checkId);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMontlyPlan);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTour);
router
  .route('/')
  .get(authController.protect, tourController.getAllTour)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
