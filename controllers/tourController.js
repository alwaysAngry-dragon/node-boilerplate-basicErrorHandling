const Tour = require('./../models/tourModel');
const ApiFearutes = require('./../utils/apiFeatures');

const AppError = require('./../utils/appError');
const catchCaAsync = require('./../utils/catchAsync');

exports.checkBody = (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.price || !body.rating) {
    return res.status(400).json({
      status: 'fail',
      message:
        'Missing required fields: name, price, and rating',
    });
  }

  next();
};

exports.topRoutes = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields =
    'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchCaAsync(async (req, res) => {
  const myQuery = new ApiFearutes(Tour.find(), req.query);

  // EXECUTE QUERY
  const features = myQuery
    .filter()
    .sort()
    .project()
    .pagination();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

exports.getATour = catchCaAsync(async (req, res, next) => {
  const tourID = req.params.tourID;

  const tour = await Tour.findById(tourID);

  if (!tour) {
    return next(
      new AppError('No tour found with that ID', 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.createTour = catchCaAsync(
  async (req, res, next) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  }
);

exports.updateTour = catchCaAsync(
  async (req, res, next) => {
    const tourID = req.params.tourID;

    const tour = await Tour.findByIdAndUpdate(
      tourID,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!tour) {
      return next(
        new AppError('No tour found with that ID', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  }
);

exports.deleteTour = catchCaAsync(
  async (req, res, next) => {
    const tourID = req.params.tourID;

    const tour = await Tour.findByIdAndDelete(tourID);

    if (!tour) {
      return next(
        new AppError('No tour found with that ID', 404)
      );
    }

    res.status(204).json({
      status: 'success',
    });
  }
);

exports.getTourStats = catchCaAsync(
  async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          minPrice: { $min: '$price' },
        },
      },
      {
        $sort: {
          numRatings: -1,
          avgRating: -1,
          _id: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      results: stats.length,
      data: { stats },
    });
  }
);

exports.getMonthlyPlan = async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(req.params.year, 0, 1),
          $lte: new Date(req.params.year, 11, 31),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: '$startDates',
        },
        numTours: { $sum: 1 },
        tours: {
          $push: '$name',
        },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTours: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: { stats },
  });
};
