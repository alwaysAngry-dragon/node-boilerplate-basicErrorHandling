// Handle undandled exceptions or synchronously unhandled exceptions/bugs
process.on('uncaughtException', (error) => {
  console.error('Unhandled Exception:', error.message);
  // Optionally, perform cleanup or restart the server
  process.exit(1);
});

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');

const app = require('./app');

const PORT = process.env.PORT || 4000;
const DATABASE_URL = process.env.DATABASE_URL;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

mongoose.connect(DATABASE_URL).then((con) => {
  console.log('Connected to database' + con.connection);
});

// Handle unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error(
    'Unhandled Rejection:',
    reason.name,
    reason.message
  );
  // Optionally: log the error, attempt to recover, or restart the app

  // closing the server connection and stopping the node process
  server.close(() => {
    process.exit(1);
  });
});
