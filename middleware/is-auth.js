'use strict';

const jwt = require('jsonwebtoken');

const User = require('../models/User');

// ==================================================

module.exports = (req, res, next) => {
  const token = req.session.token;

  // Kiểm tra xem có token hay không
  if (!token) {
    const error = new Error('Not authenticated!');

    error.statusCode = 401;

    throw error;
  }

  // Kiểm tra xem có đúng token hay không
  const decodedToken = jwt.verify(token, 'secrettoken');

  if (!decodedToken) {
    const error = new Error('Not authenticated!');

    error.statusCode = 401;

    throw error;
  }

  // Lấy data user đang login
  User.findById(decodedToken.userId)
    .then((user) => {
      if (!user) {
        const error = new Error('User not found!');

        error.statusCode = 404;

        throw error;
      }

      req.user = user;

      next();
    })
    .catch((error) => {
      error.statusCode = 500;

      throw error;
    });
};
