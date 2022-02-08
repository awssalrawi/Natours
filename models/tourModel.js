const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour Must have a Name'],
      unique: true,
      trim: true,
      //for strings we use maxlength
      maxlength: [40, 'A tour name must have less or equal 40 charachters'],
      minlength: [10, 'A tour name must more or equal 10 charachters'],
      // validate: [validator.isAlpha, 'Tour name must only Contain charachter'],
    },
    slug: String,

    duration: {
      type: Number,
      required: [true, 'A Tour Must have a duration days'],

      default: 3,
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour Must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour Must have a difficulty'],
      //value that allowed to input .. enum
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy , medium,difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      //for numbers we use max or min
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => math.round(val * 10) / 10, //* 4.6666*10 = 46.666 > 47 /10 >4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A Tour Must have a price'],
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'discount Price({VALUE}) must be below the regular price',
      },
    },

    summary: {
      type: String,
      trim: true, // remove white space
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A Tour Must have a description description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour Must have a Cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //! GeoJson ,this is embedded object inside MongoDB for locations
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      //* to use embedded document we really need this array
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
    //! for embedding
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    //! we can do child referencing but we do not want this array to grow up definatly so we use Virtual populate..
    // reviews:[{
    //  type: mongoose.Schema.ObjectId,
    //  ref: 'Review'
    // }]
  },
  {
    toJSON: { virtuals: true },

    toObject: { virtuals: true },
  }
);

//! with index : the engine does not need to search in all document because its take more time , it search as fast as possible and query the document that we want
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});
//!Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  //!foreignField:"tour" ..In our reviewModel we have field called tour and this where the İd of the tour has been storied.so we use that name of the field en order to connect each model
  localField: '_id',
});

//!Document MiddleWare.
//document middleWare will run before actual(save()) event and .creat().
//it is called hook ..pre save hook

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next(); // without next middleware will stack .
});

//! this code for embedding
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//*Reference

//!Finish Document MiddleWare.
//!Query MiddleWare
tourSchema.pre(/^find/, function (next) {
  // /^s/ all things that start with s
  //for secret or Vip tours
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  // /^s/ all things that start with s
  //for secret or Vip tours
  console.log(`Query took ${Date.now() - this.start} millisecond `);
  // console.log(docs);

  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt ',
  });
  next();
});
//!Finish Query MiddleWare

//!Aggregation MiddleWare
// tourSchema.pre('aggregate', function (next) {
//   //  console.log(this);
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
