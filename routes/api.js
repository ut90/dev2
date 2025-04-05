const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const userController = require('../controllers/userController');
const { authenticateStaff, isAdmin } = require('../middleware/auth');

router.post('/staff/login', staffController.login);
router.get('/staff/profile', authenticateStaff, staffController.getProfile);
router.post('/staff/change-password', authenticateStaff, staffController.changePassword);

router.get('/users', authenticateStaff, userController.getAllUsers);
router.get('/users/:id', authenticateStaff, userController.getUserById);
router.post('/users', authenticateStaff, userController.createUser);
router.put('/users/:id', authenticateStaff, userController.updateUser);
router.delete('/users/:id', authenticateStaff, userController.deleteUser);
router.post('/users/:id/change-password', authenticateStaff, userController.changePassword);

module.exports = router;
