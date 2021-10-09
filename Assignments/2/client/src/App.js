import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import Market from "./contracts/Market.json";
import VikreyAuction from "./contracts/VikreyAuction.json"
import getWeb3 from "./getWeb3";
import NavBar from "./components/navbar";
// import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import MarketPlace from "./components/listmarket";
import "./App.css";
// var contract = require("@truffle/contract");

class App extends Component {
  constructor(props){
    super(props)
    this.state = { 
    initialised: false,
    storageValue: 0, 
    web3: null, 
    accounts: null, 
    cur_account: null,
    contract: null,
    listings: [] 
  };
  this.activeListings = this.activeListings.bind(this);
  this.init = this.init.bind(this);
}

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
      console.log(accounts);
      // instance.options.address = `${accounts[0]}`

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, initialised: true, cur_account: accounts[0] }, this.init);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  init = async () => {
    if(this.state.initialised == false)
    return
    const { accounts, contract, web3 } = this.state;

    // await contract.methods.createListings(200,"Book",
		// 	"Harry Potter and the Philosopher's Stone"
		// ).send({ from: accounts[0] });
		await contract.methods.createListings(201100, "Mobile Phone", "One Plus 5T").call({from:accounts[0]});
    // .then(res=>{
    //   console.log(res);
    // },function(err){
    //   console.log(`error ${err}`);
    // });
		// await contract.methods.createListings(20000, "Mobile Phone", "One Plus 5T").send({ from: accounts[0] });
		// await contract.methods.createListings(3500,"Netflix screen","3 Screens, FHD").send({ from: accounts[0] });
    // await contract.methods.set(10).send({ from: accounts[0] });

    // const response = await contract.methods.get().call();
    const response = await web3.eth.getBalance(accounts[0]);
    // Update state with the result.
    console.log(response);
    this.setState({ storageValue: response });
  };

  activeListings = async() => {
    const { accounts, contract } = this.state;
    // console.log(accounts);
		await contract.methods.createListings(20000, "Mobile Phone", "One Plus 5T").send({from:accounts[0]})
    .then(res=>{
      console.log(res);
    },function(err){
      console.log(`error ${err}`);
    });

		await contract.methods.createListings(20010, "Mobile Phone", "One Plus 5T");
		// await contract.methods.createListings(20011, "Mobile Phone", "One Plus 5T").call();
    let temp = await contract.methods.fetchactivelistings().call();
    // .then(res=>{
    //   console.log(res);
    // },function(err){
    //   console.log(`error ${err}`);
    // });
    console.log(temp);

    // send({ from: this.state.accounts[0] });
    // console.log(listings);
    // this.setState({ listings });
  };

  render() { 
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
         
        {/* <NavBar/> */}
        <h1>Smart Contract - Auction</h1>
        <button onClick={this.activeListings}>
          Active Listings
        </button>
        <div>The active listings are: {this.state.listings}</div>
        <div>
                <h1>Auctions</h1>
                <div className="form-create-auction">
                    <h2>Create auction</h2>
                    {/* <div>
                        Reserve <input type="text" ref={x => this._inputReserve = x} defaultValue={0} />
                    </div> */}
                    <div>
                        Item<input type="text" ref={x => this.state.item_desc = x} defaultValue={100000000000000000} />
                    </div>
                    <div>
                        Owner <input type="text" ref={x => this.state.beneficiary = x} defaultValue={0} />
                    </div>
                    <div>
                        Ended block <input type="text" ref={x => this.state.ended = x} defaultValue={10} />
                    </div>
                    <button onClick={this.onClickCreateAuction}>Create Auction</button>
                </div>
            </div>
        {/* <MarketPlace web3 = {this.state.web3}/> */}
        {/* <div>The stored value is: {this.state.storageValue}</div> */}
      </div>
    );
  }
}

export default App;
