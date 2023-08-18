'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Session = require('../models/Session');
const io = require('../util/socket');

// ==================================================

// Lấy data của user đang login
exports.getUser = async (req, res, next) => {
  try {
    const user = await req.user.populate('cart.items.product');

    res.status(200).json(user);
  } catch (error) {
    if (!error) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Edit user information
exports.putUser = async (req, res, next) => {
  const updateUser = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
  };

  try {
    if (!updateUser.fullName) {
      const error = new Error('Please enter your full name!');

      error.statusCode = 422;

      throw error;
    }

    if (!updateUser.email) {
      const error = new Error('Please enter a valid Email!');

      error.statusCode = 422;

      throw error;
    }

    if (!updateUser.phone) {
      const error = new Error('Please enter your phone number!');

      error.statusCode = 422;

      throw error;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateUser);

    const result = await user.populate('cart.items.product');

    res
      .status(200)
      .json({ message: 'Successfully update user!', result: result });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

exports.postSignin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    if (!email) {
      const error = new Error('Please enter a valid Email!');

      error.statusCode = 422;

      throw error;
    }

    if (!password || password.length < 6) {
      const error = new Error(
        'Please enter a password with at least 6 characters!'
      );

      error.statusCode = 422;

      throw error;
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error('A user with this email dose not exist!');

      error.statusCode = 404;

      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error('Wrong password!');

      error.statusCode = 401;

      throw error;
    }

    const token = jwt.sign(
      { email: user.email, userId: user._id.toString() },
      'secrettoken'
    );

    req.session.token = token;

    res
      .status(200)
      .json({ message: 'Successfully signin!', token: token, user: user });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

exports.postSignup = async (req, res, next) => {
  const fullName = req.body.fullName;
  const email = req.body.email;
  const password = req.body.password;
  const phone = req.body.phone;

  try {
    if (!fullName) {
      const error = new Error('Please enter your full name!');

      error.statusCode = 422;

      throw error;
    }

    if (!email) {
      const error = new Error('Please enter a valid Email!');

      error.statusCode = 422;

      throw error;
    }

    if (!password || password.length < 6) {
      const error = new Error(
        'Please enter a password with at least 6 characters!!'
      );

      error.statusCode = 422;

      throw error;
    }

    if (!phone) {
      const error = new Error('Please enter your phone number!');

      error.statusCode = 422;

      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
      phone: phone,
    });

    const result = await user.save();

    res.status(201).json({ message: 'Successfully signup!', result: result });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

exports.postLogout = (req, res, next) => {
  // Xóa cookie của current user
  req.session.destroy((err) => {
    console.log(err);

    res.status(200).json({ message: 'Successfully logout!' });
  });
};

// Lấy các chat room
exports.getMessages = async (req, res, next) => {
  try {
    const sessions = await Session.find();

    res.status(200).json(sessions);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Lấy chat room theo id
exports.getMessageById = async (req, res, next) => {
  const roomId = req.params.roomId;

  try {
    const session = await Session.findById(roomId).populate({
      path: 'messages',
      populate: { path: 'user', select: 'role' },
    });

    if (!session) {
      const error = new Error(
        'Can not find any information about this room chat!'
      );

      error.statusCode = 500;

      throw error;
    }

    res.status(200).json(session);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Create chat room
exports.postMessage = async (req, res, next) => {
  const message = req.body.message;

  try {
    if (!message) {
      const error = new Error(
        'Please tell us your problem so we can support you!'
      );

      error.statusCode = 500;

      throw error;
    }

    const session = new Session({
      messages: [{ user: req.user._id, message: message }],
    });

    await session.save();

    await session.populate({
      path: 'messages',
      populate: { path: 'user', select: 'role' },
    });

    io.getIo().emit('chat', {
      action: 'create-session',
      result: session,
    });

    res
      .status(201)
      .json({ message: 'Successfully created session!', result: session });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Edit chat room
exports.putMessage = async (req, res, next) => {
  const roomId = req.params.roomId;
  const message = req.body.message;

  try {
    const session = await Session.findById(roomId);

    if (!session) {
      const error = new Error(
        'Can not find any information about this room chat!'
      );

      error.statusCode = 500;

      throw error;
    }

    session.messages.push({ user: req.user._id, message: message });

    await session.save();

    await session.populate({
      path: 'messages',
      populate: { path: 'user', select: 'role' },
    });

    io.getIo().emit('chat', {
      action: 'update-session',
      result: session.messages,
    });

    res
      .status(200)
      .json({ message: 'Successfully updated session!', result: session });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

// Delete chat room
exports.deleteMessage = async (req, res, next) => {
  const roomId = req.params.roomId;

  try {
    await Session.findByIdAndRemove(roomId);

    io.getIo().emit('chat', {
      action: 'delete-session',
      result: roomId,
    });

    res.status(200).json({ message: 'Successfully deleted session!' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};
