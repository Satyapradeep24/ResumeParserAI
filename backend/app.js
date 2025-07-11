require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const adminRoutes=require("./routes/adminRoutes")

const resumeRoutes = require("./routes/resumeRoutes");
const authRoutes = require("./routes/authRoutes");
const authController = require("./controllers/authController");

const app = express();

app.use(cors());
app.set('trust proxy', true);

app.use((req, res, next) => {
  console.log("IP Address:", req.ip);
  console.log("Forwarded IP:", req.headers['x-forwarded-for']);
  next();
});


app.use(express.json()); // For JSON body parsing
app.use(express.urlencoded({ extended: true })); // For form-data parsing


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use("/api/resume", resumeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}






const passport=require("passport")
const session=require("express-session")
const googleStrategy=require("passport-google-oauth20").Strategy

app.use(session({
  secret:"secret",
  resave:false,
  saveUninitialized:true
}))

app.use(passport.initialize())
app.use(passport.session())

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Confirm profile.emails exists
      if (!profile.emails || profile.emails.length === 0) {
        return done(new Error("No email found in Google profile"), null);
      }

      // Return entire profile to req.user
      return done(null, profile);
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser((user,done) => done(null,user))
passport.deserializeUser((user,done) =>  done(null,user))

// app.get("/", (req, res) => {
//   res.send("<a href='/auth/google'>Login with Google</a>");
// });

app.get(
  "/auth/google", 
  passport.authenticate("google", { scope: ["profile", "email"] })
);


app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const profile = req.user;
      const result = await authController.handleGoogleLogin(profile);

      if (result.isNewUser) {
        const redirectURL = new URL('https://resume-parser-ai-eight.vercel.app/complete-profile');
        redirectURL.searchParams.set('email', result.prefill.email);
        redirectURL.searchParams.set('first_name', result.prefill.first_name);
        redirectURL.searchParams.set('last_name', result.prefill.last_name);
        return res.redirect(redirectURL.toString());
      }

      // 🔥 Redirect with token for existing users
      return res.redirect(`https://resume-parser-ai-eight.vercel.app/login-success#token=${result.token}`);
    } catch (err) {
      console.error('Google login error:', err);
      res.redirect('/login');
    }
  });




app.get("/profile", (req, res) => {
  const user = req.user;

  res.send(`
    <h1>Welcome, ${user.displayName}</h1>
    <p><strong>Full Name:</strong> ${user.displayName}</p>
    <p><strong>First Name:</strong> ${user.name.givenName}</p>
    <p><strong>Last Name:</strong> ${user.name.familyName}</p>
    <p><strong>Email:</strong> ${user.emails[0].value}</p>
    <p><strong>Profile Picture:</strong></p>
    <img src="${user.photos[0].value}" alt="Profile Picture" width="150" />
    <br/><br/>
    <a href="/logout">Logout</a>
  `);
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

app.get("/", (req, res) => {
  res.send("Server is running");
});



module.exports = app;
