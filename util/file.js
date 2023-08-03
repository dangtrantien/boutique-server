'use strict';

const path = require('path');
const fs = require('fs');

// ==================================================

// Xóa ảnh trong folder khi xóa product
exports.deleteFile = (fileName) => {
  const filePath = path.join(__dirname, '..', 'public', 'images', fileName);

  fs.unlink(filePath, (err) => {
    if (err) {
      throw err;
    }
  });
};
