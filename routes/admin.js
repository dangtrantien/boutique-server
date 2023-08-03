'use strict';

const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

// ==================================================

const router = express.Router();

router.get('/users', isAuth, adminController.getUsers);

router.get('/balance', isAuth, adminController.getBalance);

router.get('/earnings', isAuth, adminController.getEarnings);

router.get('/orders', isAuth, adminController.getOrders);

router.get('/recent-orders', isAuth, adminController.getRecentOrders);

router.get('/products/search', isAuth, adminController.getSearchProductByName);

router.post('/product', isAuth, adminController.postProduct);

router.put('/product/:productId', isAuth, adminController.putProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
