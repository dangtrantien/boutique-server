'use strict';

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

// ==================================================

const router = express.Router();

router.get('/', shopController.getProducts);

router.get('/products/top-trending', shopController.getTopTrendingProducts);

router.get('/products/category', shopController.getProductsByCategory);

router.get('/product/:productId', shopController.getProductById);

router.put('/cart', isAuth, shopController.putCart);

router.delete('/delete-cart-item', isAuth, shopController.deleteCartItem);

router.get('/user/orders', isAuth, shopController.getUserOrders);

router.get('/order/:orderId', isAuth, shopController.getOrderById);

router.post('/user/order', isAuth, shopController.postUserOrder);

module.exports = router;
