const { assert } = require("console");

const Market = artifacts.require("Market.sol");

contract("Market", accounts => {
	// Test case 1
	it("should demonstrate successfully enlisting items and displaying active enlistments", async () => {
		const marketPlace = await Market.deployed();
		await marketPlace.createListings(200, "Book", "Harry Potter and the Philosopher's Stone", { from: accounts[0] });
		await marketPlace.createListings(20000, "Mobile Phone", "One Plus 5T", { from: accounts[0] });
		await marketPlace.createListings(3500, "Netflix screen", "3 Screens, FHD", { from: accounts[1] });
		console.log(await marketPlace.fetchactivelistings());
	});

	// Test case 2
	it("should demonstrate successful purchase of one item", async () => {
		const marketPlace = await Market.deployed();
		let initialBuyerBalance = await web3.eth.getBalance(accounts[2]);
		let initialSellerBalance = await web3.eth.getBalance(accounts[0]);
		console.log(
			"buyer initial balance: ",
			initialBuyerBalance,
			",seller initial balance: ",
			initialSellerBalance
		);
		await marketPlace.requestBuy(0, { from: accounts[2], value: 400 });
		await marketPlace.sellItem(0, "hagrid", { from: accounts[0], value: 400 });
		await marketPlace.confirmDelivery(0, { from: accounts[2] });
		let finalBuyerBalance = await web3.eth.getBalance(accounts[2]);
		let finalSellerBalance = await web3.eth.getBalance(accounts[0]);
		console.log(
			"buyer final balance: ",
			finalBuyerBalance,
			",seller final balance: ",
			finalSellerBalance
		);
		console.log("Final Active Listings", await marketPlace.fetchactivelistings());
	});

	// Test case 3
	it("should demonstrate successful purchase two items in parallel", async () => {
		const marketPlace = await Market.deployed();
		console.log("person 2 will be buying Netflix screen from person 1 and person 1 will be buying Mobile Phone from Person 0");
		let initialPerson0Balance = await web3.eth.getBalance(accounts[0]);
		let initialPerson1Balance = await web3.eth.getBalance(accounts[1]);
		let initialPerson2Balance = await web3.eth.getBalance(accounts[2]);
		console.log(
			"Person 0 initial balance: ",
			initialPerson0Balance,
			", Person 1 initial balance: ",
			initialPerson1Balance,
			", Person 2 initial balance: ",
			initialPerson2Balance
		);
		await marketPlace.requestBuy(2, { from: accounts[2], value: 7000 });
		await marketPlace.requestBuy(1, { from: accounts[1], value: 40000 });
		await marketPlace.sellItem(2, "Money Heist", { from: accounts[1], value: 7000 });
		await marketPlace.sellItem(1, "Android", { from: accounts[0], value: 40000 });
		await marketPlace.confirmDelivery(2, { from: accounts[2] });
		await marketPlace.confirmDelivery(1, { from: accounts[1] });
		let finalPerson0Balance = await web3.eth.getBalance(accounts[0]);
		let finalPerson1Balance = await web3.eth.getBalance(accounts[1]);
		let finalPerson2Balance = await web3.eth.getBalance(accounts[2]);
		console.log(
			"Person 0 final balance: ",
			finalPerson0Balance,
			", Person 1 final balance: ",
			finalPerson1Balance,
			", Person 2 final balance: ",
			finalPerson2Balance
		);
		console.log("Final Active Listings", await marketPlace.fetchactivelistings());
	});

	// Test case 4
	it("should demonstrate error message while trying to buy an unavailable item", async () => {
		const marketPlace = await Market.deployed();
		console.log("A person 3 will try to buy the book from Person 0");
		let initialBuyerBalance = await web3.eth.getBalance(accounts[3]);
		let initialSellerBalance = await web3.eth.getBalance(accounts[0]);
		console.log(
			"buyer initial balance: ",
			initialBuyerBalance,
			",seller initial balance: ",
			initialSellerBalance
		);
		// try {
		await marketPlace.requestBuy(0, { from: accounts[3], value: 400 });
		await marketPlace.sellItem(0, "hagrid", { from: accounts[0], value: 400 });
		await marketPlace.confirmDelivery(0, { from: accounts[3] });
		// } catch (err) 
		let finalBuyerBalance = await web3.eth.getBalance(accounts[3]);
		let finalSellerBalance = await web3.eth.getBalance(accounts[0]);
		console.log(
			"buyer final balance: ",
			finalBuyerBalance,
			",seller final balance: ",
			finalSellerBalance
		);
		console.log("Final Active Listings", await marketPlace.fetchactivelistings());
	});
});