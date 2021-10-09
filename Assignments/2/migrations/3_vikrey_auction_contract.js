var VikreyAuction = artifacts.require("./VikreyAuction.sol");

module.exports = function (deployer, network, accounts) {
	deployer.deploy(VikreyAuction, 0, 100, 100, accounts[0]);
};
