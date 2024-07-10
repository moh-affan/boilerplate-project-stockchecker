const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');


chai.use(chaiHttp);

suite("Functional Tests", function () {
    suite("GET /api/stock-prices => stockData object", function () {
        let msftLikes;
        test("1 stock", function (done) {
            chai
                .request(server)
                .get("/api/stock-prices")
                .query({ stock: "msft" })
                .end(function (err, res) {
                    //complete this one too
                    assert.equal(res.status, 200);
                    assert.property(res.body, "stockData");
                    assert.property(res.body.stockData, "stock");
                    assert.property(res.body.stockData, "price");
                    assert.property(res.body.stockData, "likes");
                    assert.equal(res.body.stockData.stock, "MSFT");
                    msftLikes = res.body.stockData.likes;
                    done();
                });
        });

        let googLikes;
        test("1 stock with like", function (done) {
            chai
                .request(server)
                .get("/api/stock-prices")
                .query({ stock: "goog", like: true })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.property(res.body, "stockData");
                    assert.property(res.body.stockData, "stock");
                    assert.property(res.body.stockData, "price");
                    assert.property(res.body.stockData, "likes");
                    assert.equal(res.body.stockData.stock, "GOOG");
                    googLikes = res.body.stockData.likes;
                    done();
                });
        });

        test("1 stock with like again (ensure likes arent double counted)", function (done) {
            chai
                .request(server)
                .get("/api/stock-prices")
                .query({ stock: "goog", like: true })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.property(res.body, "stockData");
                    assert.property(res.body.stockData, "stock");
                    assert.property(res.body.stockData, "price");
                    assert.property(res.body.stockData, "likes");
                    assert.equal(res.body.stockData.stock, "GOOG");
                    assert.equal(res.body.stockData.likes, googLikes);
                    done();
                });
        });

        test("2 stocks", function (done) {
            chai
                .request(server)
                .get("/api/stock-prices")
                .query({ stock: ["goog", "msft"] })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.property(res.body, "stockData");
                    assert.isArray(res.body.stockData);
                    assert.property(res.body.stockData[0], "stock");
                    assert.property(res.body.stockData[0], "price");
                    assert.property(res.body.stockData[0], "rel_likes");
                    assert.notProperty(res.body.stockData[0], "likes");
                    assert.property(res.body.stockData[1], "stock");
                    assert.property(res.body.stockData[1], "price");
                    assert.property(res.body.stockData[1], "rel_likes");
                    assert.notProperty(res.body.stockData[1], "likes");
                    assert.equal(res.body.stockData[0].stock, "GOOG");
                    assert.equal(res.body.stockData[1].stock, "MSFT");

                    done();
                });
        });

        test("2 stocks with like", function (done) {
            chai
                .request(server)
                .get("/api/stock-prices")
                .query({ stock: ["goog", "msft"], like: true })
                .end(function (err, res) {
                    console.log(googLikes, msftLikes);
                    assert.equal(res.status, 200);
                    assert.property(res.body, "stockData");
                    assert.property(res.body.stockData[0], "stock");
                    assert.property(res.body.stockData[0], "price");
                    assert.property(res.body.stockData[0], "rel_likes");
                    assert.notProperty(res.body.stockData[0], "likes");
                    assert.property(res.body.stockData[1], "stock");
                    assert.property(res.body.stockData[1], "price");
                    assert.property(res.body.stockData[1], "rel_likes");
                    assert.notProperty(res.body.stockData[1], "likes");
                    assert.equal(res.body.stockData[0].stock, "GOOG");
                    assert.equal(res.body.stockData[1].stock, "MSFT");
                    assert.equal(res.body.stockData[0].rel_likes, googLikes - msftLikes);
                    assert.equal(res.body.stockData[1].rel_likes, msftLikes - googLikes);

                    done();
                });
        });
    });
});

