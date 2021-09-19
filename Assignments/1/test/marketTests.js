const { assert } = require("console");

const Market = artifacts.require("Market.sol");

contract("Market", accounts => {
	// Test case 1
	it("should demonstrate successfully enlisting items and purchasing one of them", async () => {
		const marketPlace = await Market.deployed();
		await Market.createListings(200, "book", "Harry Potter and the Philosopher's Stone", { from: accounts[0] });
		await Market.createListings(50, "sandwich", "chicken mayo sandwich", { from: accounts[1] });
		let activeListings = await Market.fetchactivelistings();
		activeListings;
	});
});