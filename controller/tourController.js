const Tour = require('./../models/tourModel');
const ApiFeatures = require('./../utils/apiFeatrues');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTour = async (req, res) => {
  try {
    const features = new ApiFeatures(Tour.find(), req.query)
      .filter()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;
    res.status(200).json({
      status: 'success',
      length: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tours = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getMontlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

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
