//const fs = require('fs');

const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utilis/apiFeatures');
const catchAsync = require('./../utilis/catchAsync');
const AppError = require('./../utilis/appError');

const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const multerStorage = multer.memoryStorage(); //!by this way image will store like buffer

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image!, Please upload an image', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);
//*upload.single('image') req.file
//*upload.array('images',5) req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  //1-Cover İmage
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //2- images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );
  next();
});
//const tours = JSON.parse(
//  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
//);
/*exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }
  next();
};*/
//exports.checkBody = (req, res, next) => {
//  if (!req.body.name || !req.body.price) {
//    return res.status(400).json({
//      status: 'fail',
//      message: 'missing name or price',
//    });
//  }
//  next();
//};
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
//!before using factory
// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   if (!tour) {
//     return next(new AppError('No Tour found with that id', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour, //we can write just tours ,
//     },
//   });
// });

// const tour = tours.find((x) => x.id === req.params.id);
// console.log(req.params);
// res.status(200).json({
// status: 'success',
//  result: tours.length,
//  data: {
//   tour, //we can write just tours ,
//  },
// });

exports.createTour = factory.createOne(Tour);
//!before factory
// exports.createTour = catchAsync(async (req, res, next) => {
//   //const newTour = new Tour({})
//   //newTour.save();
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });

// } catch (err) {
//   res.status(400).json({
//     status: 'fail',
//     message: err,
//   });
// }
//});
//here we need middleware to make express modify our data.
// console.log(req.body);
// const newId = tours[tours.length - 1].id + 1;
// const newTour = Object.assign({ id: newId }, req.body);
// tours.push(newTour);
// fs.writeFile(
//  `${__dirname}/dev-data/data/tours-simple.json`,
//  JSON.stringify(tours),
//  () => {
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// };
//  );
//};
//!  exports.getAllTours before factory
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   //*Build query
//   //*1)Filtring
//   // const queryObj = { ...req.query };
//   // const excludedFields = ['page', 'sort', 'limit', 'fields'];
//   // excludedFields.forEach((el) => delete queryObj[el]);
//   // // console.log(queryObj);
//   // // console.log(req.query, queryObj);

//   // //*2)advanced filtering
//   // let queryStr = JSON.stringify(queryObj); //stringify to convert object to string
//   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//   // //console.log(queryStr);
//   // let query = Tour.find(JSON.parse(queryStr));
//   // //*Sorting

//   // if (req.query.sort) {
//   //   // console.log(typeof req.query.sort);
//   //   // mongoose do this job
//   //   const sortBy = req.query.sort.split(',').join(' ');
//   //   console.log(sortBy);
//   //   query = query.sort(sortBy);
//   //   // sort('price ratingsAverage')
//   // } else {
//   //   query.sort('createdAt');
//   // }
//   // //*field limiting.
//   // if (req.query.fields) {
//   //   const fields = req.query.fields.split(',').join(' ');
//   //   //console.log(fields);
//   //   query = query.select(fields);
//   // } else {
//   //   query.select('-__v'); //__v for including while -__v is for execluding
//   // }
//   // //*pagination
//   // //page=2&limit=10  1-10 page_1  11-20 page_2  21-30 page_3
//   // const page = req.query.page * 1 || 1; //by default  it is 1
//   // const limit = req.query.limit * 1 || 100;
//   // const skip = (page - 1) * limit;
//   // query = query.skip(skip).limit(limit);

//   // if (req.query.page) {
//   //   const numTours = await Tour.countDocuments();
//   //   if (skip >= numTours) throw new Error('This page does not exist');
//   // }
//   //console.log(JSON.parse(queryStr));
//   //const tours = await Tour.find()
//   //  .where('duration')
//   //  .equals(5)
//   //  .where('difficulty')
//   //  .equals('easy');
//   //*execute query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .pagination();

//   const tours = await features.query;

//   //* Send Respond
//   res.status(200).json({
//     status: 'success',
//     //requestedAt: req.requestTime,
//     result: tours.length,
//     data: {
//       tours, //we can write just tours ,
//     },
//   });
// });

exports.getAllTours = factory.getAll(Tour);

exports.updateTour = factory.updateOne(Tour);
//! before factory
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('No Tour found with that id', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     tour,
//   });
// });

exports.deleteTour = factory.deleteOne(Tour);

//!before creating our factory function
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No Tour found with that id', 404));
//   }
//   res.status(204).json({
//     //204 : no content
//     status: 'success',
//     message: 'Tour has been deleted.',
//   });
// });
//!PipeLines AGG

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, //'$ratingsAverage'
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
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    //204 : no content
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-1-1`),
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
      $project: {
        _id: 0, //if 1 will show up if zero will disappear
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    //204 : no content
    status: 'success',
    data: plan,
  });
});

//! '/tours-within/:distance/center/:lat lang/unit/:unit',
//* tours-distance?distance=233&center=-41.283594, 36.324203&unit=mi
//!tour-distance/233/center/41.283594, 36.324203/unit/mi .
exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng'
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { data: tours },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng'
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      //!$geoNear always should to be the first stage.
      $geoNear: {
        near: {
          type: 'point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',

    data: distances,
  });
});
