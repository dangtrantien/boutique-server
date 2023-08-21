'use strict';

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const fileHelper = require('../util/file');

// ==================================================

// Lấy data của tất cả user
exports.getUsers = async (req, res, next) => {
  const page = req.query.page;
  const limit = req.query.limit;

  try {
    const users = await User.find()
      .populate('cart.items.product')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalUser = await User.count();

    res.status(200).json({ data: users, total: totalUser });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Lấy tổng doanh thu
exports.getBalance = async (req, res, next) => {
  try {
    let totalBalance = 0;

    const orders = await Order.find().populate('user');

    orders.map((order) => (totalBalance += order.totalPrice));

    res.status(200).json({ total: totalBalance });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Lấy doanh thu trung bình hàng tháng
exports.getEarnings = async (req, res, next) => {
  try {
    let totalBalance = 0;

    const orders = await Order.find();

    // Tính tổng doanh thu trong cùng 1 tháng
    orders.map((order) => {
      if (
        new Date(order.createdAt).getMonth() === new Date().getMonth() &&
        new Date(order.createdAt).getDate() >= 1 &&
        new Date(order.createdAt).getDate() <= 30
      ) {
        totalBalance += order.totalPrice;
      }
    });

    const TB = totalBalance / 30;

    res.status(200).json({ total: TB.toFixed(2) });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Lấy data của tất cả order
exports.getOrders = async (req, res, next) => {
  const page = req.query.page;
  const limit = req.query.limit;

  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalOrder = await Order.count();

    res.status(200).json({ data: orders, total: totalOrder });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Lấy 8 order gần nhất
exports.getRecentOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user')
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json(orders);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Lấy product data theo keyword === name
exports.getSearchProductByName = async (req, res, next) => {
  const keyword = req.query.keyword;
  const page = req.query.page;
  const limit = req.query.limit;

  try {
    const products = await Product.find({
      name: { $regex: keyword.toString(), $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalProduct = await Product.find({
      name: { $regex: keyword.toString(), $options: 'i' },
    }).count();

    res.status(200).json({ data: products, total: totalProduct });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Tạo mới product
exports.postProduct = async (req, res, next) => {
  const newProduct = {
    name: req.body.name,
    category: req.body.category,
    short_desc: req.body.short_desc,
    long_desc: req.body.long_desc,
    price: req.body.price,
    count: req.body.count,
  };
  const images = req.files;

  try {
    if (!newProduct.name) {
      const error = new Error('Please enter product name!');

      error.statusCode = 422;

      // Xóa image nếu lỗi
      for (let i = 0; i < images.length; i++) {
        fileHelper.deleteFile(images[i].filename);
      }

      throw error;
    }

    if (!newProduct.category) {
      const error = new Error('Please enter product category!');

      error.statusCode = 422;

      // Xóa image nếu lỗi
      for (let i = 0; i < images.length; i++) {
        fileHelper.deleteFile(images[i].filename);
      }

      throw error;
    }

    if (!newProduct.short_desc) {
      const error = new Error(
        'Please enter short description about this product!'
      );

      error.statusCode = 422;

      // Xóa image nếu lỗi
      for (let i = 0; i < images.length; i++) {
        fileHelper.deleteFile(images[i].filename);
      }

      throw error;
    }

    if (!newProduct.long_desc) {
      const error = new Error(
        'Please enter long description about this product!'
      );

      error.statusCode = 422;

      // Xóa image nếu lỗi
      for (let i = 0; i < images.length; i++) {
        fileHelper.deleteFile(images[i].filename);
      }

      throw error;
    }

    if (!newProduct.price) {
      const error = new Error('Please enter product price!');

      error.statusCode = 422;

      // Xóa image nếu lỗi
      for (let i = 0; i < images.length; i++) {
        fileHelper.deleteFile(images[i].filename);
      }

      throw error;
    }

    if (!newProduct.count) {
      const error = new Error('Please enter product count!');

      error.statusCode = 422;

      // Xóa image nếu lỗi
      for (let i = 0; i < images.length; i++) {
        fileHelper.deleteFile(images[i].filename);
      }

      throw error;
    }

    if (images.length !== 4) {
      const error = new Error('Please select 4 images about this product!');

      error.statusCode = 422;

      // Xóa image nếu lỗi
      for (let i = 0; i < images.length; i++) {
        fileHelper.deleteFile(images[i].filename);
      }

      throw error;
    }

    const url = req.protocol + '://' + req.get('host');

    const img1 = url + '/static/images/' + images[0].filename;
    const img2 = url + '/static/images/' + images[1].filename;
    const img3 = url + '/static/images/' + images[2].filename;
    const img4 = url + '/static/images/' + images[3].filename;

    const product = new Product({
      ...newProduct,
      img1: img1,
      img2: img2,
      img3: img3,
      img4: img4,
    });

    await product.save();

    res.status(201).json({ message: 'Successfully created product!' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Edit product
exports.putProduct = async (req, res, next) => {
  const productId = req.params.productId;
  const updateProduct = {
    name: req.body.name,
    category: req.body.category,
    short_desc: req.body.short_desc,
    long_desc: req.body.long_desc,
    price: req.body.price,
    count: req.body.count,
  };

  try {
    if (!updateProduct.name) {
      const error = new Error('Please enter product name!');

      error.statusCode = 422;

      throw error;
    }

    if (!updateProduct.category) {
      const error = new Error('Please enter product category!');

      error.statusCode = 422;

      throw error;
    }

    if (!updateProduct.short_desc) {
      const error = new Error(
        'Please enter short description about this product!'
      );

      error.statusCode = 422;

      throw error;
    }

    if (!updateProduct.long_desc) {
      const error = new Error(
        'Please enter long description about this product!'
      );

      error.statusCode = 422;

      throw error;
    }

    if (!updateProduct.price) {
      const error = new Error('Please enter product price!');

      error.statusCode = 422;

      throw error;
    }

    if (!updateProduct.count) {
      const error = new Error('Please enter product count!');

      error.statusCode = 422;

      throw error;
    }

    await Product.findByIdAndUpdate(productId, updateProduct);

    res.status(200).json({ message: 'Successfully updated product!' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Xóa product
exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      const error = new Error(
        'Can not find any information about this product!'
      );

      error.statusCode = 404;

      throw error;
    }

    // Xóa image khi xóa product
    fileHelper.deleteFile(product.img1.split('/')[5]);
    fileHelper.deleteFile(product.img2.split('/')[5]);
    fileHelper.deleteFile(product.img3.split('/')[5]);
    fileHelper.deleteFile(product.img4.split('/')[5]);

    await product.deleteOne({ _id: productId });

    res.status(200).json({ message: 'Successfully deleted product!' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};
