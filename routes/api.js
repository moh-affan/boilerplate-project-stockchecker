'use strict';
var fs = require('fs');
var fetch =  (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const db = JSON.parse(fs.readFileSync(process.cwd() + "/data.json", "utf-8"));
      const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
      let stockData = { stockData: null };
      let stocks = req.query.stock;
      let like = req.query.like;
      if (!Array.isArray(req.query.stock)) {
        stocks = [req.query.stock];
      }
      for (let stock of stocks) {
        stock = stock.toUpperCase();
        let url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
        let stockRes = await fetch(url);
        let stockJson = await stockRes.json();
        if (like == 'true') {
          if (stock in db) {
            let ips = new Set(db[stock]);
            ips.add(ip);
            db[stock] = [...ips];
          } else {
            db[stock] = [ip];
          }
        }
        const likeQty = stock in db ? db[stock].length : 0;
        let data = { stock: stockJson.symbol, price: stockJson.latestPrice, likes: likeQty };
        if (stockData.stockData != null) {
          stockData.stockData = [stockData.stockData, data];
        } else {
          stockData.stockData = data;
        }
      }
      if (stockData.stockData.length == 2) {
        let first = stockData.stockData[0];
        let second = stockData.stockData[1];
        first.rel_likes = first.likes - second.likes;
        second.rel_likes = second.likes - first.likes;
        stockData.stockData = [first,second];
        delete first.likes;
        delete second.likes;
      }
      fs.writeFileSync(process.cwd() + "/data.json", JSON.stringify(db));
      res.json(stockData);
    });

};
