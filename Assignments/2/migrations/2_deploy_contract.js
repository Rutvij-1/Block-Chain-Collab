var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Market = artifacts.require("./Market.sol");
var VikreyAuction = artifacts.require("./VikreyAuction.sol");
var VikreyAuction2 = artifacts.require("./VikreyAuction2.sol");
var BlindAuction = artifacts.require("./BlindAuction.sol");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(Market);
  deployer.deploy(BlindAuction);
  deployer.deploy(VikreyAuction2);
  deployer.deploy(VikreyAuction, 0, 100, 100, accounts[0]);

};


