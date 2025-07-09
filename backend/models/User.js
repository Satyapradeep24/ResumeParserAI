const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone_number: { type: String },
  profession_title: { type: String, required: true },
  years_of_experience: { type: Number, required: true },
  linkedin_url: { type: String },
  resume_file: { type: String }, // optional, will be a path or filename
  language: { type: String, default: 'en' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  terms_accepted: { type: Boolean, required: true },
  approved: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,

}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
