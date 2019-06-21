const express = require('express');
const AuthController = require('../controllers/auth')
const BookController = require('../controllers/book')
const InstitutionController = require('../controllers/institution')
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
 * User Premer Routes
 */
router.get('/books', middleware.isStudent, BookController.user);

router.get('/admin/books', BookController.all);
router.get('/admin/books/:id', BookController.one);
router.patch('/admin/books/:id',  BookController.update);
router.post('/admin/books', BookController.create);
router.delete('/admin/books/:id',  BookController.remove);

router.get('/admin/institutions',  InstitutionController.all);
router.get('/admin/institutions/:id',  InstitutionController.one);
router.patch('/admin/institutions/:id', InstitutionController.update);
router.post('/admin/institutions', InstitutionController.create);
router.delete('/admin/institutions/:id', InstitutionController.remove);
module.exports = router;
