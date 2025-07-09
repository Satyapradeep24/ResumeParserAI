// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateUser, verifyAdmin } = require('../middleware/authMiddleware');


router.post('/adminLogin', adminController.adminLogin);


router.get('/users', adminController.getAllUsers);


router.put('/approveUser/:userId',adminController.approveUser);
router.get('/dashboard/stats', authenticateUser, verifyAdmin, adminController.getDashboardStats);


module.exports = router;
