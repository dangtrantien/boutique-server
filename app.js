'use strict';

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');
const compression = require('compression');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// ==================================================

const MONGODB_URI =
  'mongodb+srv://tiendtfx22706:alive%3Fdead@assignment-03.y6zbann.mongodb.net/shop';

const app = express();
// Lưu cookie của current user vào MongoDB
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'cookie',
});
// Lưu ảnh vào public/images
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/public/images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
// Chỉ lấy file có type là image
const fileFilter = function (req, file, cb) {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);

    return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
};

app.use(compression());
app.use(bodyParser.json());
app.use(
  cors({
    origin: ['http://192.168.1.107:3000', 'http://192.168.1.107:3001'],
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).array('images', 4)
);
// Lấy ảnh trong public/images
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    },
  })
);

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// Gửi các error cho frontend
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;

  res.status(status).json({ message: message });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    const server = app.listen(process.env.PORT || 5000);

    const io = require('./util/socket').init(server);

    io.on('connection', (socket) => {
      console.log('A user connected!');

      socket.on('disconnect', () => {
        console.log('User disconnected!');
      });
    });
  })
  .catch((err) => console.log(err));
