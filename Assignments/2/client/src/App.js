import React, { Component } from "react";
import { Card, Button, Spinner, CardGroup, Table, InputGroup } from "react-bootstrap";
import VikreyAuction from "./contracts/VikreyAuction.json"
import BlindAuction from "./contracts/BlindAuction.json"
import AveragePriceAuction from "./contracts/AveragePriceAuction.json"
import getWeb3 from "./getWeb3";
import Navbr from "./components/navbar";
import AuctionHouse from "./components/auctionHouse";
import CreateAuctions from "./components/createAuctions";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import MyBids from "./components/myBids";
import MyAuctions from "./components/myAuctions";

class App extends Component {
  constructor(props) {
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
      showcreate: false,
      showbids: false,
      showauctions: false,
      formData: {}
    };

    this.activeListings = this.activeListings.bind(this);
    this.init = this.init.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.createAuction = this.createAuction.bind(this);
    this.placeBid = this.placeBid.bind(this);
    this.showcreate = this.showcreate.bind(this);
    this.showbids = this.showbids.bind(this);
    this.showauctions = this.showauctions.bind(this);
    this.clicked = this.clicked.bind(this);
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

      const deployedNetwork1 = VikreyAuction.networks[networkId];
      const instance1 = await new web3.eth.Contract(
        VikreyAuction.abi,
        deployedNetwork1 && deployedNetwork1.address,
      );
      instance1.options.address = deployedNetwork1.address

      const deployedNetwork2 = BlindAuction.networks[networkId];
      const instance2 = await new web3.eth.Contract(
        BlindAuction.abi,
        deployedNetwork2 && deployedNetwork2.address,
      );
      instance2.options.address = deployedNetwork2.address

      const deployedNetwork3 = AveragePriceAuction.networks[networkId];
      const instance3 = await new web3.eth.Contract(
        AveragePriceAuction.abi,
        deployedNetwork3 && deployedNetwork3.address,
      );
      instance3.options.address = deployedNetwork3.address
      console.log(accounts, deployedNetwork1.address, deployedNetwork2.address, deployedNetwork3.address);
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3, accounts,
        vickrey_contract: instance1,
        blind_contract: instance2,
        average_contract: instance3,
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
    if (this.state.initialised === false)
      return
    const { accounts, vickrey_contract, web3 } = this.state;
    // const account = await web3.eth.getAccounts();
    const response = await web3.eth.getBalance(accounts[0]);
    // Update state with the result.
    console.log(response);
  };
  clicked(e) {
    e.preventDefault();
    this.state.web3.eth.request({ method: 'eth_requestAccounts' })
    .then(res=>{
      console.log(res);
    })
    .catch(err=>{
      alert(
        'something'
      )
    })
  }
  activeListings = async () => {
    const { accounts, vickrey_contract, blind_contract, average_contract, showlistings } = this.state;
    console.log(accounts);
    this.setState({ 
      showlistings: !showlistings,
      showcreate: false,
      showbids: false,
      showauctions: false
     });
  };

  showcreate(e) {
    e.preventDefault();
    this.setState({ 
      showlistings: false,
      showcreate: !this.state.showcreate,
      showbids: false,
      showauctions: false
    });
  };

  showbids(e) {
    e.preventDefault();
    this.setState({ 
      showlistings: false,
      showcreate: false,
      showbids: !this.state.showbids,
      showauctions: false
    });
  };

  showauctions(e) {
    e.preventDefault();
    this.setState({ 
      showlistings: false,
      showcreate: false,
      showbids: false,
      showauctions: !this.state.showauctions
    });
  };

  placeBid(e) {
    e.preventDefault();
    console.log(this.state.formData);
    const { deposit, secret } = this.state.formData
  };

  createAuction = async(e) => {
    e.preventDefault();
    const { accounts, blind_contract, vickrey_contract, average_contract } = this.state;
    const { item_name, item_description, bidding_deadline, reveal_deadline, auctionType } = this.state.formData;
    console.log(this.state.formData);
    let bidding_time = parseInt(((new Date(bidding_deadline)).getTime() - Date.now()) / 1000);
    let reveal_time = parseInt(((new Date(reveal_deadline)).getTime() - Date.now()) / 1000) - bidding_time;
    console.log(bidding_time, reveal_time, new Date());
    if (bidding_time <= 0) {
      alert("Invalid Bidding Deadline");
      return false;
    }
    if (reveal_time <= 0) {
      alert("Invalid Reveal Deadline");
      return false;
    }
    if (auctionType === "Blind Auction") {
      await blind_contract.methods.auctionItem(item_name, item_description, bidding_time, reveal_time)
        .send({ from: accounts[0] });
    }
    else if (auctionType === "Vickrey Auction") {
      await vickrey_contract.methods.auctionItem(item_name, item_description, bidding_time, reveal_time)
        .send({ from: accounts[0] });
    }
    else {
      await average_contract.methods.auctionItem(item_name, item_description, bidding_time, reveal_time)
        .send({ from: accounts[0] });
    }
		window.location.reload(false);
  };

  handleChange(e) {
    e.preventDefault();
    const formData = Object.assign({}, this.state.formData);
    formData[e.target.id] = e.target.value;
    this.setState({ formData: formData });
  }
  render() {
    if (!this.state.web3) {

      return <div><Spinner animation="border" />
        Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <Navbr showauctions={this.showauctions} activeListings={this.activeListings} showcreate={this.showcreate} showbids={this.showbids}/>
        <h1>Smart Auction</h1>
        <br/>
        {(!this.state.showcreate && !this.state.showlistings) && (!this.state.showbids && !this.state.showauctions) &&
        <>
        <CardGroup>
            <Card style={{ width: '18rem', marginLeft: '10px', marginRight: '10px'  }}>
              <Card.Img variant="top" src="auctionhouse.png" alt="te" />
              <Card.Body>
                <Card.Title>Auction House</Card.Title>
                <Card.Text>
                  Have a look at the active listings in the auction house!
                </Card.Text>
                <Button variant="primary" onClick={this.activeListings}>Go to Auction House</Button>
              </Card.Body>
            </Card>
            <Card style={{ width: '18rem', marginLeft: '10px', marginRight: '10px'  }}>
              <Card.Img variant="top" src="listitem.png" alt="te" />
              <Card.Body>
                <Card.Title>Create Auction Listing</Card.Title>
                <Card.Text>
                  Host your own auction and add it to the auctions!
                </Card.Text>
                <Button variant="warning" onClick={this.showcreate}>List your item</Button>
              </Card.Body>
            </Card>
        </CardGroup>
          <br/>
        <CardGroup>
          <Card style={{ width: '18rem', marginLeft: '10px', marginRight: '10px' }}>
            <Card.Img variant="top" src="myauctions.png" alt="te" />
            <Card.Body>
              <Card.Title>My Auctions</Card.Title>
              <Card.Text>
                Look and manage your auctions!
              </Card.Text>
              <Button variant="primary" onClick={this.showauctions}>My Auctions</Button>
            </Card.Body>
          </Card>
        <Card style={{ width: '18rem', marginLeft: '10px', marginRight: '10px' }}>
            <Card.Img variant="top" src="mybids.png" alt="te" />
            <Card.Body>
              <Card.Title>My Bids</Card.Title>
              <Card.Text>
                Look and manage your current bids!
              </Card.Text>
              <Button variant="primary" onClick={this.showbids}>My Bids</Button>
            </Card.Body>
          </Card>
        </CardGroup>
        </>
        }
        {this.state.showlistings &&
          <AuctionHouse web3={this.state.web3} account={this.state.currentAccount} vickrey_contract={this.state.vickrey_contract} blind_contract={this.state.blind_contract} average_contract={this.state.average_contract} />
        }
        {
          this.state.showcreate &&
          <CreateAuctions handleSubmit={this.createAuction} handleChange={this.handleChange} />
        }
        {
          this.state.showbids &&
          <MyBids web3={this.state.web3} account={this.state.currentAccount} vickrey_contract={this.state.vickrey_contract} blind_contract={this.state.blind_contract} average_contract={this.state.average_contract} />
        }
        {
          this.state.showauctions &&
          <MyAuctions web3={this.state.web3} account={this.state.currentAccount} vickrey_contract={this.state.vickrey_contract} blind_contract={this.state.blind_contract} average_contract={this.state.average_contract} />
        }

      </div>
    );
  }
}

export default App;