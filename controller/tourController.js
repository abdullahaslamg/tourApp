const Tour = require('./../models/tourModel');
const ApiFeatures = require('./../utils/apiFeatrues');
const catchAsync = require('./../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// exports.getAllTour = async (req, res) => {
//   try {
//     const tours = await Tour.find();

//     res.status(200).json({
//       status: 'successsss',
//       data: {
//         tours
//       }
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: err
//     });
//   }
// };

exports.getAllTour = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tours = await Tour.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      tours
    }
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 }
      }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        avgRating: { $avg: '$ratingsAverage' },
        totalPrice: { $sum: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMontlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-1-1`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        numToursStart: -1
      }
    },
    {
      $limit: 6
    }
  ]);

  res.status(200).json({
    status: 'success',
    length: plan.length,
    data: {
      plan
    }
  });
});

/////////Buidling queries in mongoose//////
// Person.find({
//   occupation: /host/,
//   'name.last': 'Ghost',
//   age: { $gt: 17, $lt: 66 },
//   likes: { $in: ['vaporizing', 'talking'] }
// })
//   .limit(10)
//   .sort({ occupation: -1 })
//   .select({ name: 1, occupation: 1 })
//   .exec(callback);

// // Using query builder
// Person.find({ occupation: /host/ })
//   .where('name.last')
//   .equals('Ghost')
//   .where('age')
//   .gt(17)
//   .lt(66)
//   .where('likes')
//   .in(['vaporizing', 'talking'])
//   .limit(10)
//   .sort('-occupation')
//   .select('name occupation')
//   .exec(callback);
