const express = require('express');
const AuthController = require('../controllers/auth')
const UserController = require('../controllers/user')
const middleware = require('../helpers/middleware')
require('../config/passport');

const router = express.Router();

/**
 * Auth Routes
 */
router.post('/users/create', AuthController.addUser);
router.post('/users/signin', AuthController.login);
router.post('/users/send-token', AuthController.sendToken);
router.patch('/users/reset-pass', AuthController.resetPass);

/** 
 * Admin Premer Routes
 */
router.get('/books', middleware.isStudent, UserController.all);
module.exports = router;
