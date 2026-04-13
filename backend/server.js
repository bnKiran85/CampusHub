require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const passport = require('passport');
require('./config/passport'); // Load passport configuration
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();



// Security middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// More strict AI rate limiting
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { message: 'AI rate limit exceeded. Please wait before making more AI requests.' },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/discussion', require('./routes/discussionRoutes'));
app.use('/api/ai', aiLimiter, require('./routes/aiRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusHub API is running 🚀', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.json({ message: 'CampusHub Smart Learning API', version: '2.0.0' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB & Start Server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n🚀 CampusHub Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🤖 AI Configuration: ${process.env.GEMINI_API_KEY ? 'ACTIVE ✅' : 'MISSING GEMINI_API_KEY ❌'}`);
      if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️  WARINING: AI features will fail until a valid API key is added to .env');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
