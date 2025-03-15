import connectDB from '../mongodb';
import mongoose from 'mongoose';

const createIndexes = async () => {
  try {
    await connectDB();
    console.log('Connected to database...');

    // Create indexes for Tasks collection
    await mongoose.connection.collection('tasks').createIndex(
      { projectId: 1, createdAt: -1 },
      { background: true }
    );
    console.log('Created indexes for tasks');

    // Create indexes for Messages collection
    await mongoose.connection.collection('messages').createIndex(
      { projectId: 1, createdAt: -1 },
      { background: true }
    );
    console.log('Created indexes for messages');

    // Create indexes for Project files
    await mongoose.connection.collection('projects').createIndex(
      { 'files.uploadedAt': -1 },
      { background: true }
    );
    console.log('Created indexes for projects');

    console.log('Successfully created all indexes');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
};

createIndexes();
