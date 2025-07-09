const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// -------------------- EMAIL SETUP --------------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'saisatyapradeep@gmail.com',
    pass: 'baju lzyn xypc hkgd',
  },
});

// -------------------- GENERATE OTP --------------------
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

// -------------------- REGISTER USER --------------------
exports.registerUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phone_number,
      profession_title,
      years_of_experience,
      linkedin_url,
      language,
      terms_accepted,
    } = req.body;

    if (
      !first_name || !last_name || !email || !password ||
      !profession_title || !years_of_experience || !terms_accepted
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const normalizedEmail = email.toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const newUser = new User({
      first_name,
      last_name,
      email: normalizedEmail,
      password: hashedPassword,
      phone_number,
      profession_title,
      years_of_experience,
      linkedin_url,
      language,
      terms_accepted,
      role: 'user',
      approved: false,
      otp,
      otpExpiry,
    });

    if (req.file) {
      newUser.resume_file = req.file.path;
    }

    await newUser.save();

    // Send OTP email
    await transporter.sendMail({
      from: '"Resume Parser App" <saisatyapradeep@gmail.com>',
      to: normalizedEmail,
      subject: 'OTP for Email Verification',
      html: `<p>Your OTP is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
    });

    res.status(201).json({ message: 'User registered. Check email for OTP to verify.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

// -------------------- VERIFY OTP --------------------
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    if (user.otpExpiry < new Date()) return res.status(400).json({ error: 'OTP expired' });

    user.approved = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'OTP verified. Account approved.' });
  } catch (err) {
    res.status(500).json({ error: 'OTP verification failed', details: err.message });
  }
};

// -------------------- LOGIN USER --------------------
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const foundUser = await User.findOne({ email: normalizedEmail, role: 'user' });
    if (!foundUser) return res.status(404).json({ error: 'User not found' });

    if (!foundUser.approved) return res.status(403).json({ error: 'User not approved yet' });

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign({ id: foundUser._id, role: 'user' }, SECRET, { expiresIn: '1d' });

    res.json({
      token,
      role: 'user',
      approved: true,
      user: {
        id: foundUser._id,
        first_name: foundUser.first_name,
        last_name: foundUser.last_name,
        email: foundUser.email,
        phone_number: foundUser.phone_number,
        profession_title: foundUser.profession_title,
        years_of_experience: foundUser.years_of_experience,
        linkedin_url: foundUser.linkedin_url,
        language: foundUser.language,
        resume_file: foundUser.resume_file,
        terms_accepted: foundUser.terms_accepted,
        approved: foundUser.approved,
        role: foundUser.role,
        createdAt: foundUser.createdAt,
        updatedAt: foundUser.updatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.approved) return res.status(400).json({ error: 'User already approved' });

    // Generate new OTP & expiry
    const newOtp = Math.floor(100000 + Math.random() * 900000);
    const newOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = newOtp;
    user.otpExpiry = newOtpExpiry;
    await user.save();

    // Send OTP email
    await transporter.sendMail({
      from: '"Resume Parser App" <saisatyapradeep@gmail.com>',
      to: normalizedEmail,
      subject: 'Resent OTP for Email Verification',
      html: `<p>Your new OTP is <strong>${newOtp}</strong>. It will expire in 10 minutes.</p>`,
    });

    res.json({ message: 'OTP resent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resend OTP', details: err.message });
  }
};


exports.getResumeCount = async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log(userId);
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const count = await ResumeHistory.countDocuments({ userId });
    res.json({ count });
  } catch (err) {
    console.error("Error counting resume history:", err);
    res.status(500).json({ error: "Failed to count resumes" });
  }
};

const ResumeHistory = require('../models/ResumeHistory');

exports.getUserResumeHistory = async (req, res) => {
  try {
    const histories = await ResumeHistory.find({ userId: req.user.id }).sort({ timestamp: -1 });
    console.log('User id: ',  req.user.id)
    // console.log('histories: ',histories)
    res.json(histories);
  } catch (error) {
    console.error('Error fetching resume history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

const AiScore = require("../models/AiScoreSchema");

exports.getAiScoreCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await AiScore.countDocuments({ userId });
    // console.log(userId)
    // console.log(count)
    res.status(200).json({ count });
  } catch (err) {
    console.error("Error fetching AI score count:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getAiScoreHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const scores = await AiScore.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(scores);
  } catch (err) {
    console.error("Error fetching AI score history:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!user.approved) {
    return res.status(403).json({ error: 'Account not verified. Contact admin.' });
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  await transporter.sendMail({
    from: '"Resume Parser App" <saisatyapradeep@gmail.com>',
    to: normalizedEmail,
    subject: 'OTP for Password Reset',
    html: `<p>Your password reset OTP is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
  });

  res.json({ message: 'OTP sent to your email for password reset' });
};

exports.verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  if (user.otpExpiry < new Date()) return res.status(400).json({ error: 'OTP expired' });

  res.json({ message: 'OTP verified. You can now reset your password.' });
};



exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    const normalizedEmail = email.toLowerCase();

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Both password fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed', details: err.message });
  }
};


// authController.js (add this function)
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const foundAdmin = await User.findOne({ email: normalizedEmail, role: 'admin' });
    if (!foundAdmin) return res.status(404).json({ error: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, foundAdmin.password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign({ id: foundAdmin._id, role: 'admin' }, SECRET, { expiresIn: '1d' });

    res.json({
      token,
      role: 'admin',
      approved: true,
      user: {
        id: foundAdmin._id,
        first_name: foundAdmin.first_name,
        last_name: foundAdmin.last_name,
        email: foundAdmin.email,
        phone_number: foundAdmin.phone_number,
        profession_title: foundAdmin.profession_title,
        years_of_experience: foundAdmin.years_of_experience,
        linkedin_url: foundAdmin.linkedin_url,
        language: foundAdmin.language,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Admin login failed', details: err.message });
  }
};


exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      first_name,
      last_name,
      phone_number,
      profession_title,
      years_of_experience,
      linkedin_url,
      language,
    } = req.body;

    const updateFields = {
      first_name,
      last_name,
      phone_number,
      profession_title,
      years_of_experience,
      linkedin_url,
      language,
    };

    // Handle resume file upload
    if (req.file) {
      const filePath = req.file.path;

      // Optional: delete old resume file
      const user = await User.findById(userId);
      if (user.resume_file && fs.existsSync(user.resume_file)) {
        fs.unlinkSync(user.resume_file);
      }

      updateFields.resume_file = filePath;
    }

    const updated = await User.findByIdAndUpdate(userId, updateFields, { new: true });

    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};


const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateCoverLetter = async (req, res) => {
  try {
    const { resumeText, jobDescription, tone = 'formal' } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "resumeText and jobDescription are required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    });

    const prompt = `
      You are an AI cover letter writer.

      Using this resume information:
      """
      ${resumeText}
      """

      And this job description:
      """
      ${jobDescription}
      """

      Write a personalized cover letter for the position applying to, in a ${tone} tone.

      Make it professional, concise, and highlight the candidate's key skills and experience relevant to the job.

      Return ONLY the cover letter text without any additional commentary.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const coverLetter = response.text().trim();

    res.json({ coverLetter });

  } catch (error) {
    console.error("Error generating cover letter:", error);
    res.status(500).json({ error: "Failed to generate cover letter" });
  }
};
