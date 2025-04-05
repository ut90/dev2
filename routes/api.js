const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const userController = require('../controllers/userController');
const bookController = require('../controllers/bookController');
const lendingController = require('../controllers/lendingController');
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

router.get('/lendings', authenticateStaff, lendingController.getAllLendings);
router.get('/lendings/:id', authenticateStaff, lendingController.getLendingById);
router.post('/lendings', authenticateStaff, lendingController.createLending);
router.post('/lendings/:lendingId/return', authenticateStaff, lendingController.returnBook);
router.get('/lendings/overdue', authenticateStaff, lendingController.getOverdueBooks);
router.get('/users/:userId/lending-history', authenticateStaff, lendingController.getUserLendingHistory);

module.exports = router;
