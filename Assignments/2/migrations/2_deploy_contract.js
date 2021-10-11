// var VikreyAuction2 = artifacts.require("VikreyAuction2.sol");
var VikreyAuction = artifacts.require("VikreyAuction.sol");
var BlindAuction = artifacts.require("BlindAuction.sol");
var AveragePriceAuction = artifacts.require("./AveragePriceAuction.sol");


module.exports = function (deployer, network, accounts) {
    deployer.deploy(BlindAuction);
    deployer.deploy(VikreyAuction);
    // deployer.deploy(VikreyAuction2, 0, 100, 100, accounts[0]);
    deployer.deploy(AveragePriceAuction);


};
