dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from './models/User.js'; // Your user model
import Product from './models/Product.js';
import path from 'path';
import { fileURLToPath } from 'url';


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));


// ----- Middleware -----
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// ----- Database Connection -----
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); 
  }
})();
// ---------- Email Transport ----------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ----- Passport config -----
passport.serializeUser((user, done) => {
  done(null, user._id); // only store id
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value
        });
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
));

app.use((req, res, next) => {
  console.log('Incoming:', req.method, req.url);
  next();
});

// ----- Routes -----
// ---------- Signup Route ----------
app.post('/signup', async (req, res) => {
  console.log('Signup route hit');
  try {
    const {name, email, password} = req.body;
    console.log('Signup route triggered');

    // 1. Check existing user
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create unverified user
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      googleId: null,
      isVerified: false, 
    });

    // 4. Send verification email
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const verifyLink = `http://localhost:${process.env.PORT}/verify/${token}`;

    const info = await transporter.sendMail({
      from: `"Dreamsol" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your Dreamsol account',
      html: `<p>Hello ${name || ''}, please verify your email by clicking
             <a href="${verifyLink}">this link</a>.</p>`,
    });
    
    console.log('Email sent:', info.response);
    return res.json({ message: 'Signup successful. Check your email to verify.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Email Verification ----------
app.get('/verify/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findByIdAndUpdate(decoded.id, { isVerified: true }, { new: true });
    if (!user) return res.status(400).send('Invalid verification link');
    res.send('✅ Email verified. You can now log in.');
  } catch (err) {
    res.status(400).send('Verification link expired or invalid.');
  }
});

// Local login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid email or password' });

  res.json({ message: 'Login successful', id: user._id, name: user.name });
});

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => res.redirect('/account')
);

app.get('/account', (req, res) =>
  req.isAuthenticated()
    ? res.send(`Hello ${req.user.name}`)
    : res.redirect('/')
);

// ---------- Products API ----------
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});
// ----- Start server -----
app.listen(process.env.PORT, () =>
  console.log(`Server running on http://localhost:${process.env.PORT}`)
);