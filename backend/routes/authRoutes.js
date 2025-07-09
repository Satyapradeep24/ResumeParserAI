// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const {authenticateUser} = require('../middleware/authMiddleware');


// Setup resume file upload
const storage = multer.diskStorage({
  destination: './uploads/resumes/',


  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
  }
});
const upload = multer({ storage });

// POST /api/auth/registerUser
router.post('/registerUser', upload.single('resume_file'), authController.registerUser);

// POST /api/auth/userLogin
router.post('/userLogin', authController.loginUser);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);
router.get('/count', authenticateUser, authController.getResumeCount);
router.get('/history', authenticateUser, authController.getUserResumeHistory);
router.get("/ai-score-count", authenticateUser, authController.getAiScoreCount);
router.get("/ai-score-history", authenticateUser, authController.getAiScoreHistory);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOtp);
router.post('/reset-password', authController.resetPassword);


// adminRoutes.js
router.post('/adminLogin', authController.loginAdmin);







module.exports = router;
