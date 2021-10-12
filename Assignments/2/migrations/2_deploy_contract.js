var VikreyAuction = artifacts.require("VikreyAuction.sol");
var BlindAuction = artifacts.require("BlindAuction.sol");
var AveragePriceAuction = artifacts.require("./AveragePriceAuction.sol");


module.exports = function (deployer, network, accounts) {
    deployer.deploy(BlindAuction);
    deployer.deploy(VikreyAuction);
    deployer.deploy(AveragePriceAuction);
};
