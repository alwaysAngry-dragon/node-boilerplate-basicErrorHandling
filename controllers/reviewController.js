const Review = require('./../models/reviewModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllReviews = catchAsync(async function (
  req,
  res,
  next
) {
  const reviews = await Review.find()
    .populate({
      path: 'user',
      select: 'name email',
    })
    .populate({
      path: 'tour',
      select: 'name',
    });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

exports.addReview = catchAsync(async function (
  req,
  res,
  next
) {
  req.body.user = req.currentUser._id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { review: newReview },
  });
});
