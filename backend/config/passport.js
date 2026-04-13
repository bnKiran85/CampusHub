const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const { id, displayName, emails, photos } = profile;
        const email = emails[0].value;
        const avatar = photos[0].value;

        try {
          // 1. Check if user already exists with this googleId
          let user = await User.findOne({ googleId: id });

          if (user) {
            return done(null, user);
          }

          // 2. Check if user exists with the same email (but no googleId)
          user = await User.findOne({ email });

          if (user) {
            // Link Google account to existing email account
            user.googleId = id;
            user.provider = 'google';
            if (!user.avatar) user.avatar = avatar;
            await user.save();
            return done(null, user);
          }

          // 3. Create new user
          user = await User.create({
            name: displayName,
            email,
            googleId: id,
            provider: 'google',
            avatar,
            course: 'General'
          });

          return done(null, user);
        } catch (err) {
          console.error('Passport Google Strategy Error:', err);
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn('⚠️  WARINING: Google OAuth credentials missing. Social login will be disabled.');
}

// Passport session setup (not used for JWT but needed for initialization)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});
