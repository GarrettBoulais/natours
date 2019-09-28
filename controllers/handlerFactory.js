const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      // return just to exit method
      return next(new AppError('No document found with that ID', 404));
    }

    // 204 means successful delete
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      // return just to exit method
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newdocument = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: newdocument
      }
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    // get tour and populate guides field with actual data from users table
    const doc = await query;
    // Tour.findOne({_id: req.params.id})

    if (!doc) {
      // return just to exit method
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on Tour (hack);
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    if (req.params.userId) filter = { user: req.params.userId };
    // BUILD QUERY ----------------
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // EXECUTE QUERY --------------
    // const doc = await features.query.explain();
    const doc = await features.query;

    // SEND RESPONSE --------------
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
  });
