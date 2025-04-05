const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const userController = require('../controllers/userController');
const bookController = require('../controllers/bookController');
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

router.get('/books', authenticateStaff, bookController.getAllBooks);
router.get('/books/:id', authenticateStaff, bookController.getBookById);
router.post('/books', authenticateStaff, bookController.createBook);
router.put('/books/:id', authenticateStaff, bookController.updateBook);
router.delete('/books/:id', authenticateStaff, bookController.deleteBook);
router.get('/categories', authenticateStaff, bookController.getCategories);

module.exports = router;
