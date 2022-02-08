const express = require('express');

const res = require('express/lib/response');

const tourController = require('./../controllers/tourController');

const router = express.Router();
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');

// const reviewController = require('../controllers/reviewController');
//router.param('id');

//************************************************************** */
//Post/tour/idNum
//Get/tour/idNum/reviews/idNum
//get/tour/IdNum/reviews/idNum
//!bad practice to create review inside tour router
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

//**************************************************************** */

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithin);
//* tours-distance?distance=233&center=-40,45&unit=mi
//!tour-distance/233/center/-40,45/unit/mi .. this way more cleaner than above one

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
