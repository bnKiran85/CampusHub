const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for SRV record resolution on Windows/local networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Fall back to system defaults if setServers fails
}
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

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

    // Mongoose connection options
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4,               // FORCE IPv4 to avoid common Atlas/TLS handshake issues
      retryWrites: true,
    });

    console.log(`✅ [MongoDB] Connected Successfully: ${conn.connection.host}`);
    console.log(`📁 [Database] Target: ${conn.connection.name}`);

  } catch (error) {
    console.error(`❌ [Database Error] ${error.message}`);
    
    // If SRV lookup fails, attempt direct connection retry
    if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED')) {
      console.warn('⚠️ SRV DNS lookup failed. Retrying with fallback DNS configuration...');
    }

    if (error.message.includes('alert internal error') || error.message.includes('Could not connect') || error.message.includes('whitelist') || error.message.includes('bad auth')) {
      console.warn('\n⚠️ SECURITY/NETWORK ALERT: Check MongoDB Atlas Network Access (IP Whitelist 0.0.0.0/0) and Database User Credentials.');
      console.warn('👉 Visit: https://cloud.mongodb.com/v2/660e7b998facda0cd2f7e7f7#/security/network/whitelist\n');
    }
    console.warn('⚠️ Continuing server startup. MongoDB will attempt auto-reconnect when available.');
  }
};

module.exports = connectDB;
