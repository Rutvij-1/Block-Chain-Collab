const { assert } = require("console");

const Market = artifacts.require("Market.sol");

contract("Market", accounts => {
	// Test case 1
	it("should demonstrate successfully enlisting items and purchasing one of them", async () => {
		const marketPlace = await Market.deployed();
		await marketPlace.createListings(200, "book", "Harry Potter and the Philosopher's Stone", { from: accounts[0] });
		await marketPlace.createListings(50, "sandwich", "chicken mayo sandwich", { from: accounts[1] });
		let activeListings = await marketPlace.fetchactivelistings();
		console.log(activeListings);
		let initialBuyerBalance = await web3.eth.getBalance(accounts[0]);
		let initialSellerBalance = await web3.eth.getBalance(accounts[1]);
		console.log(
			"buyer initial balance: ",
			initialBuyerBalance,
			",seller initial balance: ",
			initialSellerBalance
		);
		await marketPlace.requestBuy(1, { from: accounts[0], value: 100 });
		await marketPlace.sellItem(1, "testing", { from: accounts[1], value: 100 });
		await marketPlace.confirmDelivery(1, { from: accounts[0] });
		let finalBuyerBalance = await web3.eth.getBalance(accounts[0]);
		let finalSellerBalance = await web3.eth.getBalance(accounts[1]);
		console.log(
			"buyer final balance: ",
			finalBuyerBalance,
			",seller final balance: ",
			finalSellerBalance
		);
	});
});