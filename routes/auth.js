'use strict';

const express = require('express');

const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

// ==================================================

const router = express.Router();

router.get('/user', isAuth, authController.getUser);

router.put('/user', isAuth, authController.putUser);

router.post('/signin', authController.postSignin);

router.post('/signup', authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/messages', isAuth, authController.getMessages);

router.get('/message/:roomId', isAuth, authController.getMessageById);

router.post('/message', isAuth, authController.postMessage);

router.put('/message/:roomId', isAuth, authController.putMessage);

router.delete('/message/:roomId', isAuth, authController.deleteMessage);

module.exports = router;
