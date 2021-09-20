const Market = artifacts.require("Market.sol");

contract("Market", accounts => {
	// Test case 1
	it("should demonstrate successfully enlisting items and displaying active enlistments", async () => {
		const marketPlace = await Market.deployed(); // Creating instance of contract
		await marketPlace.createListings(200,
			"Book",
			"Harry Potter and the Philosopher's Stone",
			{ from: accounts[0] }
		); // Enlist and item
		await marketPlace.createListings(20000, "Mobile Phone", "One Plus 5T", { from: accounts[0] }); // Enlist and item
		await marketPlace.createListings(
			3500,
			"Netflix screen",
			"3 Screens, FHD",
			{ from: accounts[1] }
		); // Enlist and item
		console.log(await marketPlace.fetchactivelistings()); // Display active listings
	});

	// Test case 2
	it("should demonstrate successful purchase of one item", async () => {
		const marketPlace = await Market.deployed(); // Creating instance of contract
		let initialBuyerBalance = await web3.eth.getBalance(accounts[2]); // Get initial balance of buyer
		let initialSellerBalance = await web3.eth.getBalance(accounts[0]); // Get initial balance of seller
		console.log(
			"buyer initial balance: ",
			initialBuyerBalance,
			",seller initial balance: ",
			initialSellerBalance
		);
		await marketPlace.requestBuy(0, { from: accounts[2], value: 400 }); // Make request for purchase of an item
		await marketPlace.sellItem(0, "hagrid", { from: accounts[0], value: 400 }); // Sell the item to the buyer
		await marketPlace.confirmDelivery(0, { from: accounts[2] }); // Confirm Delivery of the purchased item
		let finalBuyerBalance = await web3.eth.getBalance(accounts[2]); // Get final balance of buyer
		let finalSellerBalance = await web3.eth.getBalance(accounts[0]); // Get final balance of seller
		console.log(
			"buyer final balance: ",
			finalBuyerBalance,
			",seller final balance: ",
			finalSellerBalance
		);
		console.log("Final Active Listings", await marketPlace.fetchactivelistings()); // Display active listings
	});

	// Test case 3
	it("should demonstrate successful purchase two items in parallel", async () => {
		const marketPlace = await Market.deployed(); // Creating instance of contract
		console.log("person 2 will be buying Netflix screen from person 1 and person 1 will be buying Mobile Phone from Person 0");
		let initialPerson0Balance = await web3.eth.getBalance(accounts[0]); // Get initial balance of person 0
		let initialPerson1Balance = await web3.eth.getBalance(accounts[1]); // Get initial balance of person 1
		let initialPerson2Balance = await web3.eth.getBalance(accounts[2]); // Get initial balance of person 2
		console.log(
			"Person 0 initial balance: ",
			initialPerson0Balance,
			", Person 1 initial balance: ",
			initialPerson1Balance,
			", Person 2 initial balance: ",
			initialPerson2Balance
		);
		await marketPlace.requestBuy(2, { from: accounts[2], value: 7000 }); // Make request for purchase of an item
		await marketPlace.requestBuy(1, { from: accounts[1], value: 40000 }); // Make request for purchase of an item
		await marketPlace.sellItem(2, "Money Heist", { from: accounts[1], value: 7000 }); // Sell the item to the buyer
		await marketPlace.sellItem(1, "Android", { from: accounts[0], value: 40000 }); // Sell the item to the buyer
		await marketPlace.confirmDelivery(2, { from: accounts[2] }); // Confirm Delivery of the purchased item
		await marketPlace.confirmDelivery(1, { from: accounts[1] }); // Confirm Delivery of the purchased item
		let finalPerson0Balance = await web3.eth.getBalance(accounts[0]); // Get final balance of person 0
		let finalPerson1Balance = await web3.eth.getBalance(accounts[1]); // Get final balance of person 1
		let finalPerson2Balance = await web3.eth.getBalance(accounts[2]); // Get final balance of person 2
		console.log(
			"Person 0 final balance: ",
			finalPerson0Balance,
			", Person 1 final balance: ",
			finalPerson1Balance,
			", Person 2 final balance: ",
			finalPerson2Balance
		);
		console.log("Final Active Listings", await marketPlace.fetchactivelistings()); // Display active listings
	});

	// Test case 4
	it("should demonstrate error message while trying to buy an unavailable item", async () => {
		const marketPlace = await Market.deployed(); // Creating instance of contract
		console.log("A person 3 will try to buy the book from Person 0");
		let initialBuyerBalance = await web3.eth.getBalance(accounts[3]); // Get initial balance of buyer
		let initialSellerBalance = await web3.eth.getBalance(accounts[0]); // Get initial balance of seller
		console.log(
			"buyer initial balance: ",
			initialBuyerBalance,
			",seller initial balance: ",
			initialSellerBalance
		);
		try {
			await marketPlace.requestBuy(0, { from: accounts[3], value: 400 }); // Make request for purchase of an item
			await marketPlace.sellItem(0, "hagrid", { from: accounts[0], value: 400 }); // Sell the item to the buyer
			await marketPlace.confirmDelivery(0, { from: accounts[3] }); // Confirm Delivery of the purchased item
		} catch (error) {
			console.log(
				"\n An Error occurred during transaction because ",
				error.reason,
				"\n"
			); // Display reason of transaction failing
		}
		let finalBuyerBalance = await web3.eth.getBalance(accounts[3]); // Get final balance of buyer
		let finalSellerBalance = await web3.eth.getBalance(accounts[0]); // Get final balance of seller
		console.log(
			"buyer final balance: ",
			finalBuyerBalance,
			",seller final balance: ",
			finalSellerBalance
		);
		console.log("Final Active Listings", await marketPlace.fetchactivelistings()); // Display active listings
	});
});