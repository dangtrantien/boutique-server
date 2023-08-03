'use strict';

// Function phân chia page
module.exports = (dataArr) => {
  if (!dataArr) {
    return;
  }

  const pages = [];
  const pageCountList = [0];

  // Tổng số page
  if (dataArr.length > 8) {
    while (pageCountList.length <= Math.round(dataArr.length / 8)) {
      pageCountList.push(pageCountList.length);
    }
  }

  // Data của 1 page và số page
  pageCountList.map((pageNumber) => {
    const data = [];

    for (let i = pageNumber * 8; i < 8 + pageNumber * 8; i++) {
      if (dataArr[i]) {
        data.push(dataArr[i]);
      }
    }

    pages.push({
      page: pageNumber + 1,
      results: data,
    });
  });

  return { total: dataArr.length, result: pages };
};
