import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import Market from "./contracts/Market.json";
import getWeb3 from "./getWeb3";
// import Market

import "./App.css";

class App extends Component {
  state = { 
    initialised: false,
    storageValue: 0, 
    web3: null, 
    accounts: null, 
    contract: null,
    listings: [] 
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Market.networks[networkId];
      const instance = await new web3.eth.Contract(
        Market.abi,
        deployedNetwork && deployedNetwork.address,
      );
      instance.options.address = `${accounts[0]}`

      // const deployedNetwork = SimpleStorageContract.networks[networkId];
      // const instance = new web3.eth.Contract(
      //   SimpleStorageContract.abi,
      //   deployedNetwork && deployedNetwork.address,
      // );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, initialised: true }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    if(this.state.initialised == false)
    return
    const { accounts, contract, web3 } = this.state;

    await contract.methods.createListings(200,"Book",
			"Harry Potter and the Philosopher's Stone"
		).send({ from: accounts[0] });
		// await contract.methods.createListings(20000, "Mobile Phone", "One Plus 5T").send({ from: accounts[0] });
		// await contract.methods.createListings(3500,"Netflix screen","3 Screens, FHD").send({ from: accounts[0] });
    // await contract.methods.set(10).send({ from: accounts[0] });

    // const response = await contract.methods.get().call();
    const response = await web3.eth.getBalance(accounts[0]);
    // Update state with the result.
    console.log(response);
    this.setState({ storageValue: response });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Smart Contract - Auction</h1>
        <div>The stored value is: {this.state.storageValue}</div>
      </div>
    );
  }
}

export default App;
