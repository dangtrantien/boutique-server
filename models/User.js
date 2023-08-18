'use strict';

const mongoose = require('mongoose');

// ==================================================

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: String,
    role: {
      type: String,
      default: 'client',
    },
    cart: {
      items: [
        {
          product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
          total: {
            type: Number,
            required: true,
          },
        },
      ],
      totalItem: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Thêm product vào cart
userSchema.methods.addToCart = function (product, newQuantity) {
  const cartProductIndex = this.cart.items.findIndex(
    (item) => item.product.toString() === product._id.toString()
  );

  const updatedCartItems = [...this.cart.items];
  let updateTotalItem = 0;

  // Nếu đã có product trong cart thì thay đổi quantity vs total
  if (cartProductIndex >= 0) {
    updatedCartItems[cartProductIndex].quantity = newQuantity;

    updatedCartItems[cartProductIndex].total = product.price * newQuantity;
  } else {
    // Nếu chưa có product trong cart thì thêm mới vào cart
    updatedCartItems.push({
      product: product._id,
      quantity: newQuantity,
      total: product.price * newQuantity,
    });
  }

  updatedCartItems.map((item) => (updateTotalItem += item.quantity));

  this.cart.items = updatedCartItems;
  this.cart.totalItem = updateTotalItem;

  return this.save();
};

// Xóa product khỏi cart
userSchema.methods.removeFromCart = function (productId) {
  const cartProductIndex = this.cart.items.findIndex(
    (item) => item.product.toString() === productId
  );
  const cartItems = [...this.cart.items];

  const updatedCartItems = cartItems.filter(
    (item) => item.product.toString() !== productId
  );

  const updateTotalItem =
    this.cart.totalItem - cartItems[cartProductIndex].quantity;

  this.cart.items = updatedCartItems;
  this.cart.totalItem = updateTotalItem;

  return this.save();
};

// Làm trống cart sau khi order
userSchema.methods.clearCart = function () {
  this.cart.items = [];
  this.cart.totalItem = 0;

  return this.save();
};

module.exports = mongoose.model('User', userSchema);
