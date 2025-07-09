require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const adminRoutes=require("./routes/adminRoutes")

const resumeRoutes = require("./routes/resumeRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());

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




module.exports = app;
