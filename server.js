const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('Uncaught Expection .....');
  console.log(err);
  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//console.log(app.get('env')); //env : environment
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
  });
// .catch((err) => {
//   console.log('Errorrrrrr');
// });
//console.log(process.env);
const port = process.env.PORT || 3000;
//const port = 3000;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('Problem happened .....');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

//! for sefty but we need it above
// process.on('uncaughtException', (err) => {
//   console.log('Uncaught Expection .....');
//   console.log(err);
//   server.close(() => {
//     process.exit(1);
//   });
// });

//!Mongoose

/*
const testTour = new Tour({
  name: 'The Forest Hiker',
  rating: 4.7,
  price: 497,
});
testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('Error MN', err);
  }); // this simple.
*/
