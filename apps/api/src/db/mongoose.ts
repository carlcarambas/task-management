const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        'mongodb://root:example@localhost:27017/task-manager?authSource=admin'
    );
    console.log('Connected to MongoDB');

    // Check the connection
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
      console.log('MongoDB database connection established successfully');
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;
