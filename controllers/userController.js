const User = require('./../models/userModel');
const multer = require('multer');
const catchAsync = require('./../utilis/catchAsync');
const AppError = require('./../utilis/appError');
const factory = require('./handlerFactory');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-id-time(ms).jpeg
//     const ext = file.mimetype.split('/')[1]; //find the extension of the file
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
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

exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`; //!we need this filename because we used it in save to database
  if (!req.file) return next();
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//!before factory
// exports.getAllUsers = catchAsync(async (req, res) => {
//   const user = await User.find();
//   res.status(200).json({
//     status: 'success',
//     data: {
//       length: user.length,
//       user,
//     },
//   });
// });

exports.updateMe = catchAsync(async (req, res, next) => {
  //*1- Create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    next(
      new AppError(
        'this route is not for password updates. Please use /updateMYpassword',
        400
      )
    );
  }
  //*2- Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename; //!add photo property tp filtered body object
  //*3- Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'this route not yet defined! please use sign Up ',
  });
};

// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'fail',
//     message: 'this route not yet defined',
//   });
// };
exports.getAllUsers = factory.getAll(User);
//!Do not try to change password with this function
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getUser = factory.getOne(User);
