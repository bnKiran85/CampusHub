const mongoose = require('mongoose');

/**
 * Expert Database Connection Handler
 * Targets production stability and network-level resilience.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    
    // Masked logging for safety
    const maskedUri = uri ? uri.replace(/:([^@]+)@/, ':****@') : 'undefined';
    console.log(`⏳ [Atlas] Attempting secure handshake with: ${maskedUri}`);

    // Expert-level driver options
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4,               // FORCE IPv4 to avoid common Atlas/TLS handshake issues
      authSource: 'admin',     // Ensure authentication targets the system database if required
      retryWrites: true,
      retryWrites: true,
    });

    console.log(`✅ [MongoDB] Connected Successfully: ${conn.connection.host}`);
    console.log(`📁 [Database] Target: ${conn.connection.name}`);

  } catch (error) {
    console.error(`❌ [Database Error] ${error.message}`);
    
    // Check for specific whitelisting symptoms
    if (error.message.includes('alert internal error') || error.message.includes('Could not connect')) {
      console.warn('\n⚠️  SECURITY ALERT: Your IP address likely needs to be whitelisted in MongoDB Atlas.');
      console.warn('👉 Visit: https://cloud.mongodb.com/v2/660e7b998facda0cd2f7e7f7#/security/network/whitelist\n');
    }
    
    // Exit if this is the primary connection attempt
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
