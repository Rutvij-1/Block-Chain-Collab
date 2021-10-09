var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Market = artifacts.require("./Market.sol");
var VikreyAuction = artifacts.require("./VikreyAuction.sol");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(Market);
  deployer.deploy(VikreyAuction, 0, 100, 100, accounts[0]);
};
