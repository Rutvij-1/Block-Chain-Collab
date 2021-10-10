import React, { Component } from "react";
import VickreyAuction2 from "./contracts/VickreyAuction2.json"
import BlindAuction from "./contracts/BlindAuction.json"
import getWeb3 from "./getWeb3";
import NavBar from "./components/navbar";
import MarketPlace from "./components/listmarket";
import "./App.css";

class App extends Component {
  constructor(props){
    super(props)

    this.state = { 
    initialised: false,
    web3: null, 
    accounts: null, 
    currentAccount: null,
    blind_contract: null,
    vickrey_contract: null,
    average_contract: null,
    listings: [],
    showlistings: false,
    formData: {}
  };

  this.activeListings = this.activeListings.bind(this);
  this.init = this.init.bind(this);
  this.cancelAuction = this.cancelAuction.bind(this);
  this.onClickBid = this.onClickBid.bind(this);
  this.handleChange = this.handleChange.bind(this);
  this.createAuction = this.createAuction.bind(this);
}

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      // Get the contract instances.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork1 = VickreyAuction2.networks[networkId];
      const instance1 = await new web3.eth.Contract(
        VickreyAuction2.abi,
        deployedNetwork1 && deployedNetwork1.address,
      );
      instance1.options.address = deployedNetwork1.address

      const deployedNetwork2 = BlindAuction.networks[networkId];
      const instance2 = await new web3.eth.Contract(
        BlindAuction.abi,
        deployedNetwork2 && deployedNetwork2.address,
      );
      instance2.options.address = deployedNetwork2.address
      console.log(accounts,deployedNetwork1.address, deployedNetwork2.address);
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, 
        vickrey_contract: instance1, 
        blind_contract: instance2, 
        initialised: true, 
        currentAccount: accounts[0] 
      }, this.init);
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
    const { accounts, vickrey_contract, web3 } = this.state;

    // await contract.methods.auctionItem("Book",
		// 	"Harry Potter and the Philosopher's Stone",100,10000
		// ).send({ from: accounts[0] });
		// await contract.methods.auctionItem("Mobile Phone", "One Plus 5T",100,111010).send({from:accounts[0]});
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
    const { accounts, vickrey_contract, blind_contract, showlistings } = this.state;
    console.log(accounts);
		// await contract.methods.createListings(20010, "Mobile Phone", "One Plus 5T");
		// await contract.methods.createListings(20011, "Mobile Phone", "One Plus 5T").call();
    let temp = await vickrey_contract.methods.getactiveauctions().call();
    let ret = await blind_contract.methods.getactiveauctions().call();
    temp = temp.concat(ret)
    console.log(temp);
    this.setState({ listings:temp, showlistings:!showlistings });
  };

  onClickBid = async() => {

  };
  cancelAuction = async() => {

  };

  createAuction(e) {
    e.preventDefault();
    const { accounts, blind_contract, vickrey_contract, average_contract  } = this.state;
    const { item_name,item_description,bidding_time,reveal_time, auctionType } = this.state.formData;
    console.log(this.state.formData);
    if(auctionType === "Blind Auction"){
      blind_contract.methods.auctionItem(item_name, item_description, bidding_time, reveal_time)
      .send({ from: accounts[0] });
    }
    else if(auctionType === "Vickrey Auction"){
      vickrey_contract.methods.auctionItem(item_name, item_description, bidding_time, reveal_time)
      .send({ from: accounts[0] });
    }
    else{
      average_contract.methods.auctionItem(item_name, item_description, bidding_time, reveal_time)
      .send({ from: accounts[0] });
    }
  };

  handleChange(e) {
    e.preventDefault();
    const formData = Object.assign({}, this.state.formData);
    formData[e.target.id] = e.target.value;
    this.setState({ formData: formData });
}
  render() { 
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <NavBar/>
        <h1>Smart Contract - Auction</h1>
        <button onClick={this.activeListings}>
          Show Active Listings
        </button>
        {this.state.showlistings ?
        <>
        <div>The active listings are:</div>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <table>
          <thead>
            <tr>
              <td>Auction ID</td>
              <td>Item Name</td>
              <td>Item Description</td>
              <td>Bidding Time</td>
              <td>Bid Reveal Time</td>
              <td>Sold</td>
              {/* <td>Seller</td>
              <td>Buyer</td>
              <td>Price</td>
              <td>Buyer Alloted</td> */}
              <td>Status</td>
              <td>Bid</td>
            </tr>
          </thead>
          <tbody>
            {this.state.listings.map(listing => {
              let status = 'Active'
              let sold = "False"
              if (listing.ended) {
                  status = 'Ended'
                  sold = "True"
              } 
              return (
                <tr key={listing.auction_id}>
                  <td>{listing.auction_id}</td>
                  <td>{listing.item_name}</td>
                  <td>{listing.item_description}</td>
                  <td>{listing.biddingEnd}</td>
                  <td>{listing.revealEnd}</td>
                  <td>{sold}</td>
                  <td>{status}</td>
                  <td>
                    {listing.owner == this.state.currentAccount && (status === 'Active' || status === 'Unstarted') ?
                        <button onClick={() => this.cancelAuction(listing)}>Cancel</button>
                        :
                      <div>
                        <input ref={x => this._inputBidAmount = x} />
                        <button onClick={() => this.onClickBid(listing)}>Bid</button>
                      </div>
                    }
                  </td>
                </tr>
              )
          })}
          </tbody>
        </table>
        </div>
        </>
        :
        <div>
          <h1>Auctions</h1>
          <div className="form-create-auction">
            <form onSubmit={this.createAuction}>
              <h2>Create auction</h2>
              <div>
                  Item Name<br/> <input type="item_name" className="form-control" id="item_name" required onChange={this.handleChange} placeholder="Item Name" />
              </div>
              <div>
                  Item description <br/><input type="item_description" className="form-control" id="item_description" required onChange={this.handleChange} placeholder="Item description" />
              </div>
              <div>
                  Bidding Time<br/> <input type="bidding_time" className="form-control" id="bidding_time" required onChange={this.handleChange} placeholder={100} />
              </div>
              <div>
              Reveal Time<br/> <input type="reveal_time" className="form-control" id="reveal_time" required onChange={this.handleChange} placeholder={100} />
              </div>
              <div>
                Auction Type <br/>
                <select id="auctionType" placeholder="Select Auction Type" required onChange={this.handleChange}>
                  <option value="Blind Auction">Blind Auction</option>
                  <option value="Vickrey Auction">Vickrey Auction</option>
                  <option value="Average Price Auction">Average Price Auction</option>
                </select>
              </div>
              <br/>
              <button type="submit">Create Auction</button>
            </form>
          </div>
        </div>
        }
      </div>
    );
  }
}

export default App;
