import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/financial-lead-capture';
    
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 MongoDB URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    const conn = await mongoose.connect(mongoURI, {
      // Modern connection options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      w: 'majority'
    });

    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`📊 Connection State: ${mongoose.connection.readyState}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('disconnecting', () => {
      console.log('⚠️ Mongoose disconnecting from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during MongoDB shutdown:', err);
        process.exit(1);
      }
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Make sure MongoDB is running on your system');
      console.error('💡 Start MongoDB with: mongod --dbpath /path/to/your/db');
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 Check your MongoDB credentials in the connection string');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Check your MongoDB host address');
    }
    
    process.exit(1);
  }
};

// Create default admin user if it doesn't exist
export const createDefaultAdmin = async () => {
  try {
    // Wait for connection to be ready
    if (mongoose.connection.readyState !== 1) {
      console.log('⏳ Waiting for MongoDB connection...');
      await new Promise(resolve => {
        mongoose.connection.once('connected', resolve);
      });
    }
    
    const User = (await import('../models/User.js')).default;
    
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      console.log('🔐 Creating default admin user...');
      
      const adminUser = new User({
        name: 'Administrator',
        email: 'admin@company.com',
        password: 'admin123',
        role: 'admin'
      });
      
      await adminUser.save();
      
      console.log('✅ Default admin user created successfully:');
      console.log('   Email: admin@company.com');
      console.log('   Password: admin123');
      console.log('   Role: admin');
      console.log('   ID:', adminUser._id);
    } else {
      console.log('ℹ️ Admin user already exists:', adminExists.email);
    }
  } catch (error) {
    console.error('❌ Error creating default admin user:', error);
  }
};

export default connectDB;