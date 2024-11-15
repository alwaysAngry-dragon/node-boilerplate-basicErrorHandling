const mongoose = require('mongoose');
const tourSechema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [
        40,
        'A tour name must have less or equal than 40 characters',
      ],
      minlength: [
        5,
        'A tour name must have more or equal than 5 characters',
      ],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
      min: [1, 'A tour must have at least 1 day'],
      max: [30, 'A tour must not exceed 30 days'],
    },
    maxGroupSize: {
      type: Number,
      required: [
        true,
        'A tour must have a maximum group size',
      ],
      min: [1, 'A tour must have at least 1 person'],
      max: [50, 'A tour must not exceed 50 people'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'hard', 'difficult'],
        message:
          'Difficulty must be either easy, medium, or hard',
      },
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price; // this value of 'this' wont exist for update operations, because it will refer to the query in updates operation and not the document
        },
        message: 'Price Discount must be lower than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
    },
    images: [String],
    createdAd: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // longitude, latitude,
      address: String,
      description: String,
    },
    locations: [
      // this is an array of embedded geo location document
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSechema.index({ name: 1 });
tourSechema.index({ startLocation: '2dsphere' });

tourSechema.virtual('durationWeeks').get(function () {
  // console.log('Running virtual for each document');
  return this.duration / 7;
});

// virtual populate
tourSechema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
  justOne: false, // if true, it will return only one document from the reviews array
});

tourSechema.pre('save', function (next) {
  console.log(
    'Pre save middleware...before document is saved into the database'
  );
  next();
});

tourSechema.pre('find', function (next) {
  console.log('Pre find tour middleware...query executed');
  next();
});

tourSechema.pre('findOne', function (next) {
  console.log(
    'Pre find tour One middleware...query executed'
  );
  console.log(this);
  next();
});

const Tour = mongoose.model('Tour', tourSechema);

module.exports = Tour;
