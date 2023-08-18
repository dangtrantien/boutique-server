'use strict';

const mongoose = require('mongoose');

// ==================================================

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    img1: {
      type: String,
      required: true,
    },
    img2: {
      type: String,
      required: true,
    },
    img3: {
      type: String,
      required: true,
    },
    img4: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    short_desc: {
      type: String,
      required: true,
    },
    long_desc: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    totalSaled: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Thay đổi số lượng product khi user order
productSchema.methods.orderProduct = function (quantity) {
  let updateCount = this.count;
  let updateTotalSaled = this.totalSaled;

  if (this.count > 0 && this.count >= quantity) {
    updateCount -= quantity;
    updateTotalSaled += quantity;
  }

  this.count = updateCount;
  this.totalSaled = updateTotalSaled;

  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
