// controllers/adminController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET);
    res.json({ token, role: 'admin', approved: true });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.approveUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await User.findByIdAndUpdate(userId, { approved: true });
    res.json({ message: 'User approved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

const ResumeHistory = require('../models/ResumeHistory');
const AiScore = require('../models/AiScoreSchema');

exports.getDashboardStats = async (req, res) => {
  try {
    const role = req.user?.role;
    console.log('User role:', role);  // Log the user's role
    
    if (role !== 'admin') {
      console.log('Access denied: Non-admin user');  // Log when access is denied
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    console.log('Fetching statistics...');

    const [totalUsers, approvedUsers, pendingApprovals, resumesParsed, aiScoresGenerated] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', approved: true }),
      User.countDocuments({ role: 'user', approved: false }),
      ResumeHistory.countDocuments(),
      AiScore.countDocuments(),
    ]);

    // console.log('Total users:', totalUsers);
    // console.log('Approved users:', approvedUsers);
    // console.log('Pending approvals:', pendingApprovals);
    // console.log('Resumes parsed:', resumesParsed);
    // console.log('AI scores generated:', aiScoresGenerated);

    const jobsMatched = await AiScore.countDocuments({ postAppliedFor: { $exists: true, $ne: '' } });
    console.log('Jobs matched:', jobsMatched);

    res.json({
      totalUsers,
      approvedUsers,
      pendingApprovals,
      resumesParsed,
      aiScoresGenerated,
      jobsMatched,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};


const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  try {
    const { userId, modelType, action, startDate, endDate } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (modelType) query.modelType = modelType;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .populate('userId', 'first_name last_name email');

    res.json(logs);
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};
