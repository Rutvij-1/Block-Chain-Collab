import React, { Component } from "react";
import { Card, Button, Spinner, CardGroup, Table, InputGroup } from "react-bootstrap";
import VikreyAuction from "./contracts/VikreyAuction.json"
import BlindAuction from "./contracts/BlindAuction.json"
import AveragePriceAuction from "./contracts/AveragePriceAuction.json"
import getWeb3 from "./getWeb3";
import NavBar from "./components/navbar";
import MarketPlace from "./components/listmarket";
import ListAuctionItem from "./components/listItem";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

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
            formData: {}
        };

        this.activeListings = this.activeListings.bind(this);
        this.init = this.init.bind(this);
        this.cancelAuction = this.cancelAuction.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.createAuction = this.createAuction.bind(this);
        this.placeBid = this.placeBid.bind(this);
        this.showcreate = this.showcreate.bind(this);
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
        const accounts = await web3.eth.getAccounts();
        const response = await web3.eth.getBalance(accounts[0]);
        // Update state with the result.
        console.log(response);
    };

    activeListings = async () => {
        const { accounts, vickrey_contract, blind_contract, average_contract, showlistings } = this.state;
        console.log(accounts);
        // await contract.methods.createListings(20010, "Mobile Phone", "One Plus 5T");
        // await contract.methods.createListings(20011, "Mobile Phone", "One Plus 5T").call();
        // let temp = await vickrey_contract.methods.getactiveauctions().call();
        // let ret = await blind_contract.methods.getactiveauctions().call();
        // temp = temp.concat(ret)
        // console.log(temp);
        this.setState({ showlistings: !showlistings });
    };

    showcreate(e) {
        e.preventDefault();
        this.setState({ showcreate: !this.state.showcreate });
    };

    cancelAuction = async () => {

    };

    placeBid(e) {
        e.preventDefault();
        console.log(this.state.formData);
        const { deposit, secret } = this.state.formData
    };

    createAuction(e) {
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
            blind_contract.methods.auctionItem(item_name, item_description, bidding_time, reveal_time)
                .send({ from: accounts[0] });
        }
        else if (auctionType === "Vickrey Auction") {
            vickrey_contract.methods.auctionItem(item_name, item_description, bidding_time, reveal_time)
                .send({ from: accounts[0] });
        }
        else {
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

            return <div><Spinner animation="border" />
                Loading Web3, accounts, and contract...</div>;
        }
        return (
            <div className="App">
                <NavBar />
                <h1>Smart Contract - Auction</h1>
                {(!this.state.showcreate && !this.state.showlistings) &&
                    <CardGroup>
                        <Card style={{ width: '18rem' }}>
                            <Card.Img variant="top" src="auctionhouse.png" alt="te" />
                            <Card.Body>
                                <Card.Title>Auction House</Card.Title>
                                <Card.Text>
                                    Have a look at the active listings in the auction house!
                                </Card.Text>
                                <Button variant="success" onClick={this.activeListings}>Go to Auction House</Button>
                            </Card.Body>
                        </Card>
                        <Card style={{ width: '18rem' }}>
                            <Card.Img variant="top" src="listitem.png" alt="te" />
                            <Card.Body>
                                <Card.Title>Create Auction Listing</Card.Title>
                                <Card.Text>
                                    Add your own listing to the auctions!
                                </Card.Text>
                                <Button variant="warning" onClick={this.showcreate}>List your item</Button>
                            </Card.Body>
                        </Card>
                    </CardGroup>
                }
                {this.state.showlistings &&

                    <MarketPlace web3={this.state.web3} account={this.state.currentAccount} vickrey_contract={this.state.vickrey_contract} blind_contract={this.state.blind_contract} average_contract={this.state.average_contract} />
                }
                {
                    this.state.showcreate &&
                    <ListAuctionItem handleSubmit={this.createAuction} handleChange={this.handleChange} />
                }

            </div>
        );
    }
}

export default App;