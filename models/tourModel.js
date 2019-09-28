const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have at most 40 characters'],
      minlength: [10, 'A tour name must have at least 10 characters']
      // validate: [validator.isAlpha, 'Name must only contain characters']
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can be: easy, medium, or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A rating must be above 1.0'],
      max: [5, 'A rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10 // round to 1 decimal place
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(value) {
          // this only points to current doc on NEW document creation
          return value < this.price;
        },
        message: 'discount price ({VALUE}) must be less than price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover photo']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false // not included in any queries
    },
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  // Options
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// create an index
// tourSchema.index({price: 1}); // 1 = ascending order
tourSchema.index({ price: 1, ratingsAverage: -1 }); // 1 = ascending order
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// note this property is not part of database so we cant query it
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review', // reference review model
  foreignField: 'tour', // in Review, connect its tour to this tour
  localField: '_id' // match foreign field to id of this tour
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
// 'save' is a hook. Whole thing is called pre save hook
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// embed users as tour guides for a tour
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides =  await Promise.all(guidesPromises);

//   next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides', // key we are populating
    select: '-__v -_passwordChangedAt' // remove from output
  });

  next();
});

// AGGREGATION MIDDLEWARE
// hide secret tours from stats
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

tourSchema.post(/^find/, function(docs, next) {
  // console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  // console.log(docs);
  next();
});

// create a tour model from our schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour; // export tour model
