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


mongoose.connect('mongodb://localhost:27017/resume_parser_db', {
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

passport.use(new googleStrategy({
  clientID:process.env.GOOGLE_CLIENT_ID,
  clientSecret:process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback"
},async(accessToken,refreshToken,profile,done)=>{
  try{
    const { token, user } = await authController.handleGoogleLogin(profile);
    done(null, { token, user });
  }
  catch(error){
    done(error, null);
  }
}))

passport.serializeUser((user,done) => done(null,user))
passport.deserializeUser((user,done) =>  done(null,user))

// app.get("/", (req, res) => {
//   res.send("<a href='/auth/google'>Login with Google</a>");
// });

app.get(
  "/auth/google", 
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const token = req.user.token;
    res.redirect(`http://localhost:3001/login-success#token=${token}`);
  }
);
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



module.exports = app;
