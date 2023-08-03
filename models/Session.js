'use strict';

const mongoose = require('mongoose');

// ==================================================

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  messages: [
    {
      user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
      message: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model('Session', sessionSchema);
