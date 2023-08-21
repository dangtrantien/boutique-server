'use strict';

const nodemailer = require('nodemailer');

const Product = require('../models/Product');
const Order = require('../models/Order');

// ==================================================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tiendtfx22706@funix.edu.vn',
    pass: 'alive?dead',
  },
});

// Lấy tất cả product
exports.getProducts = async (req, res, next) => {
  const page = req.query.page;
  const limit = req.query.limit;

  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalProduct = await Product.count();

    res.status(200).json({ data: products, total: totalProduct });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Lấy 8 product bán chạy nhất
exports.getTopTrendingProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ totalSaled: -1 }).limit(8);

    res.status(200).json(products);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Lấy product theo category
exports.getProductsByCategory = async (req, res, next) => {
  const category = req.query.category;
  const page = req.query.page;
  const limit = req.query.limit;

  try {
    const products = await Product.find({ category: category })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalProduct = await Product.find({ category: category }).count();

    res.status(200).json({ data: products, total: totalProduct });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Lấy product theo id
exports.getProductById = async (req, res, next) => {
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

    res.status(200).json(product);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Lưu cart data của current user
exports.putCart = async (req, res, next) => {
  const product = req.body.product;
  const quantity = req.body.quantity;

  try {
    if (quantity === 0) {
      const error = new Error('Please select product quantity!');

      error.statusCode = 422;

      throw error;
    }

    const user = await req.user.addToCart(product, quantity);

    const result = await user.populate('cart.items.product');

    res
      .status(200)
      .json({ message: 'Successfully add product to cart!', result: result });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Xóa item khỏi cart của current user
exports.deleteCartItem = async (req, res, next) => {
  const productId = req.body.productId;

  try {
    const user = await req.user.removeFromCart(productId);

    const result = await user.populate('cart.items.product');

    res.status(200).json({
      message: 'Successfully remove product from cart!',
      result: result,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Lấy các order của current user
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(orders);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Lấy order theo _id
exports.getOrderById = async (req, res, next) => {
  const orderId = req.params.orderId;

  try {
    const order = await Order.findById(orderId).populate('user');

    if (!order) {
      const error = new Error('Can not find any information about this order!');

      error.statusCode = 404;

      throw error;
    }

    res.status(200).json(order);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Lưu order của current user
exports.postUserOrder = async (req, res, next) => {
  const products = req.body.products;
  const totalPrice = req.body.totalPrice;

  try {
    if (!products) {
      const error = new Error('Product detail not found!');

      error.statusCode = 422;

      throw error;
    }

    if (!totalPrice) {
      const error = new Error('Total price not found!');

      error.statusCode = 422;

      throw error;
    }

    const order = new Order({
      user: req.user._id,
      products: products,
      totalPrice: totalPrice,
    });

    const result = await order.save();

    // Gửi email cho user
    await transporter.sendMail({
      from: 'tiendtfx22706@funix.edu.vn',
      to: req.user.email,
      subject: 'Đơn hàng của bạn',
      html: `
        <div style="font-family: sans-serif;">
          <h1 style="font-size: 24px;font-weight: bold;">Xin Chào ${
            req.user.fullName
          }</h1>

          <p>Phone: ${req.user.phone}</p>

          <p>Address: ${req.user.address}</p>

          <p>Thời gian đặt hàng: ${new Date(
            result.createdAt
          ).toLocaleString()}</p>

          <table>
            <thead>
              <tr>
                <th style="padding: 10px;text-align: center;border: 1px solid #000;">Tên Sản Phẩm</th>
                <th style="padding: 10px;text-align: center;border: 1px solid #000;">Hình Ảnh</th>
                <th style="padding: 10px;text-align: center;border: 1px solid #000;">Giá</th>
                <th style="padding: 10px;text-align: center;border: 1px solid #000;">Số Lượnng</th>
                <th style="padding: 10px;text-align: center;border: 1px solid #000;">Thành Tiền</th>
              </tr>
            </thead>
            <tbody>
            ${result.products
              .map(
                (prod) =>
                  `
                  <tr key=${prod.product._id}>
                    <td style="padding: 10px;text-align: center;border: 1px solid #000;">
                      ${prod.product.name}
                    </td>
                    <td style="border: 1px solid #000;">
                      <img style="width:100px; height:100px" src="${
                        prod.product.img1
                      }" alt="${prod.product.name}" />
                    </td>
                    <td style="padding: 10px;text-align: center;border: 1px solid #000;">
                      ${prod.product.price.toLocaleString('de-DE')} VND
                    </td>
                    <td style="padding: 10px;text-align: center;border: 1px solid #000;">
                      ${prod.quantity}
                    </td>
                    <td style="padding: 10px;text-align: center;border: 1px solid #000;">
                      ${prod.total.toLocaleString('de-DE')} VND
                    </td>
                  </tr>
                `
              )
              .join('')}
            </tbody>
          </table>

          <h2 style="margin-bottom: 0;">Tổng Thanh Toán:</h2>

          <span style="font-size: 24px;font-weight: bold;">
            ${result.totalPrice.toLocaleString('de-DE')} VND
          </span>

          <h1 style="font-size: 24px;font-weight: bold;">Cảm ơn bạn!</h1>
        </div>
      `,
    });

    products.map(async (prod) => {
      const product = await Product.findById(prod.product._id);

      await product.orderProduct(prod.quantity);
    });

    await req.user.clearCart();

    res
      .status(201)
      .json({ message: 'Successfully place order!', result: result });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};
