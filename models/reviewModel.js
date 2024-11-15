const mongoose = require('mongoose');

const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review field is required'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating field is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// pre find query middleware for find

reviewSchema.pre('find', function (next) {
  console.log(
    'Pre find review middleware...query executed'
  );
  next();
});

reviewSchema.statics.calculateAverageRating =
  async function (tourID) {
    const stats = await this.aggregate([
      {
        $match: { tour: tourID },
      },
      {
        $group: {
          _id: '$tour',
          nRating: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    await Tour.findByIdAndUpdate(tourID, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].averageRating.toFixed(2),
    });
  };

reviewSchema.post('save', function () {
  // this will refer to the saved document
  this.constructor.calculateAverageRating(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
