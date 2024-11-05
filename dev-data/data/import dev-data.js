const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');
// const User = require('./../../models/userModel');
// const Review = require('./../../models/reviewModel');

dotenv.config({ path: '../../config.env' });

// const connectionParams = {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false,
// };

mongoose
  .connect(process.env.DATABASE_URL)
  .then((connection) => {
    console.log('Connected to local database');
  })
  .catch((error) => {
    console.log('Error connecting to remote database: ');
    console.log(error);
  });

// Read JSON file

const tours = fs.readFileSync(
  __dirname + '/tours.json',
  'utf8'
);

const users = fs.readFileSync(
  __dirname + '/users.json',
  'utf8'
);

const reviews = fs.readFileSync(
  __dirname + '/reviews.json',
  'utf8'
);

// IMPORT DATA INTO DATABASE

const importData = async () => {
  try {
    await Tour.create(JSON.parse(tours));
    // await User.create(JSON.parse(users));
    // await Review.create(JSON.parse(reviews));
    console.log('Tour Data Loaded');
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

// DELETE ALL DATA FROM COLLECTION

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    // await User.deleteMany();
    // await Review.deleteMany();
    console.log('Data Deleted');
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

importData();

// deleteData();
