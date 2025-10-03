const mongoose = require('mongoose');

const testMongoDBConnection = async () => {
  console.log('🔍 Testing MongoDB connection...');
  
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackwave';
    console.log(`📡 Connecting to: ${mongoURI}`);
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`📊 Database: ${dbName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections (${collections.length}):`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Test creating a test document
    const testCollection = db.collection('connection_test');
    const testDoc = {
      message: 'HackWave MongoDB connection test',
      timestamp: new Date(),
      status: 'success'
    };
    
    const result = await testCollection.insertOne(testDoc);
    console.log(`✅ Test document inserted with ID: ${result.insertedId}`);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('🧹 Test document cleaned up');
    
    // Disconnect
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected successfully');
    console.log('🎉 MongoDB setup is working perfectly!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('   Error:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting steps:');
    console.error('   1. Make sure MongoDB is installed and running');
    console.error('   2. Check if MongoDB service is started');
    console.error('   3. Verify the connection string in .env file');
    console.error('   4. Check firewall settings');
    console.error('   5. Ensure port 27017 is not blocked');
    
    process.exit(1);
  }
};

// Run the test
testMongoDBConnection();
