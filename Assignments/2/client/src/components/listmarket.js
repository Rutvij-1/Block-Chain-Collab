// use this.props.web3
import React, { Component } from 'react'
import { Table, Button, InputGroup } from 'react-bootstrap';

class MarketPlace extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentAccount: '',
      listings: [],
      makebid: false,
      formData: {}
    }
    this.handleChange = this.handleChange.bind(this);
    this.makeBid = this.makeBid.bind(this);
    this.endAuction = this.endAuction.bind(this);
    this.revealBid = this.revealBid.bind(this);
    this.withdrawDeposit = this.withdrawDeposit.bind(this);
  }
  componentDidMount = async () => {
    try {
      let offSet = 1000;
      let blindAuctions = await this.props.blind_contract.methods.getactiveauctions().call();
      for (let i = 0; i < blindAuctions.length; ++i) {
        blindAuctions[i]["type"] = "Blind Auction";
        blindAuctions[i]["new_auction_id"] = parseInt(blindAuctions[i]["auction_id"]) + offSet;
        blindAuctions[i]["bidding_deadline"] = new Date(blindAuctions[i]["biddingEnd"] * 1000);
        blindAuctions[i]["reveal_deadline"] = new Date(blindAuctions[i]["revealEnd"] * 1000);
      }
      offSet += blindAuctions.length;
      let vikreyAuctions = await this.props.vickrey_contract.methods.getactiveauctions().call();
      for (let i = 0; i < vikreyAuctions.length; ++i) {
        vikreyAuctions[i]["type"] = "Vikrey Auction";
        vikreyAuctions[i]["new_auction_id"] = parseInt(vikreyAuctions[i]["auction_id"]) + offSet;
        vikreyAuctions[i]["bidding_deadline"] = new Date(vikreyAuctions[i]["biddingEnd"] * 1000);
        vikreyAuctions[i]["reveal_deadline"] = new Date(vikreyAuctions[i]["revealEnd"] * 1000);
      }
      offSet += vikreyAuctions.length;
      let averageAuctions = await this.props.average_contract.methods.getactiveauctions().call();
      for (let i = 0; i < averageAuctions.length; ++i) {
        averageAuctions[i]["type"] = "Average Price Auction";
        averageAuctions[i]["new_auction_id"] = parseInt(averageAuctions[i]["auction_id"]) + offSet;
        averageAuctions[i]["bidding_deadline"] = new Date(averageAuctions[i]["biddingEnd"] * 1000);
        averageAuctions[i]["reveal_deadline"] = new Date(averageAuctions[i]["revealEnd"] * 1000);
      }
      offSet += averageAuctions.length;
      let auctions = [].concat(blindAuctions, vikreyAuctions, averageAuctions);
      this.setState({ listings: auctions, currentAccount: this.props.account });

    } catch (error) {
      alert(`Loading...`);
      console.error(error);
    }
  };

  makeBid = (auction_id, type) => e => {
    e.preventDefault();
    const { value, secret_key, deposit } = this.state.formData;
    this.setState({ makebid: !this.state.makebid });
    console.log(parseInt(Date.now() / 1000));
    if (type === "Blind Auction") {
      try {
        this.props.blind_contract.methods.bid(
          this.props.web3.utils.keccak256(
            this.props.web3.eth.abi.encodeParameters(
              ["uint256", "string"],
              [value, secret_key]
            )
          ),
          parseInt(auction_id)
        ).send({
          from: this.state.currentAccount,
          value: deposit
        });
      } catch (error) {
        console.log(error);
      }
    } else if (type === "Vikrey Auction") {
      try {
        this.props.vickrey_contract.methods.bid(
          this.props.web3.utils.keccak256(
            this.props.web3.eth.abi.encodeParameters(
              ["uint256", "string"],
              [value, secret_key]
            )
          ),
          parseInt(auction_id)
        ).send({
          from: this.state.currentAccount,
          value: deposit
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        this.props.average_contract.methods.bid(
          this.props.web3.utils.keccak256(
            this.props.web3.eth.abi.encodeParameters(
              ["uint256", "string"],
              [value, secret_key]
            )
          ),
          parseInt(auction_id)
        ).send({
          from: this.state.currentAccount,
          value: deposit
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  revealBid = (auction_id, type) => (e) => {
    e.preventDefault();
    let listing = this.state.listings[auction_id];
    const { blind_contract, vickrey_contract, average_contract } = this.state
    console.log(listing, type);
    if (type === "Blind Auction") {
      // blind_contract.reveal

    } else if (type === "Vikrey Auction") {

    } else {

    }
  };

  endAuction = (auction_id, type) => (e) => {
    e.preventDefault();
    const { blind_contract, vickrey_contract, average_contract } = this.state;
    try {
      if (type === "Blind Auction") {
        this.props.blind_contract.methods.auctionEnd(
          parseInt(auction_id)
        ).send({
          from: this.state.currentAccount
        });
      } else if (type === "Vikrey Auction") {
        this.props.vickrey_contract.methods.auctionEnd(
          parseInt(auction_id)
        ).send({
          from: this.state.currentAccount
        });
      } else {
        this.props.average_contract.methods.auctionEnd(
          parseInt(auction_id)
        ).send({
          from: this.state.currentAccount
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  withdrawDeposit = (auction_id, type) => (e) => {
    e.preventDefault();
    let listing = this.state.listings[auction_id];
    const { blind_contract, vickrey_contract, average_contract } = this.state
    console.log(listing, type);
    if (type === "Blind Auction") {
      // blind_contract.withdraw

    } else if (type === "Vikrey Auction") {

    } else {

    }
  };

  handleChange(e) {
    e.preventDefault();
    const formData = Object.assign({}, this.state.formData);
    formData[e.target.id] = e.target.value;
    this.setState({ formData: formData });
  };

  render() {
    return (
      <>
        <h2>The active listings are:</h2>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <td>Auction ID</td>
                <td>Auction Type</td>
                <td>Item Name</td>
                <td>Item Description</td>
                <td>Bidding Time</td>
                <td>Bid Reveal Time</td>
                <td>Manage</td>
              </tr>
            </thead>
            <tbody>
              {this.state.listings.map(listing => {
                let status = 'Active'
                let sold = "False"
                if (Date.now() > listing.bidding_deadline) {
                  status = 'Bidding Over'
                }
                if (listing.ended) {
                  status = 'Ended'
                  sold = "True"
                }
                return (
                  <tr key={listing.new_auction_id}>
                    <td>{listing.new_auction_id}</td>
                    <td>{listing.type}</td>
                    <td>{listing.item_name}</td>
                    <td>{listing.item_description}</td>
                    <td>{listing.bidding_deadline.toTimeString()}</td>
                    <td>{listing.reveal_deadline.toTimeString()}</td>
                    <td>
                      {listing.beneficiary === this.state.currentAccount ?
                        (status === 'Ended') ?
                          <Button onClick={this.endAuction(listing.new_auction_id, listing.type)} variant="secondary">End Auction</Button>
                          :
                          <Button variant="success">Active</Button>
                        :
                        (status === 'Active') ?
                          <>
                            {listing.bidplaced === true ?
                              <div>
                                <Button variant="info" disabled>Bid Placed</Button>
                              </div>
                              :
                              <div>
                                <InputGroup>
                                  <input type="number" className="form-control" id="value" required onChange={this.handleChange} placeholder="Bid Amount" />
                                  <input type="password" className="form-control" id="secret_key" required onChange={this.handleChange} placeholder="Secret Key" />
                                  <input type="number" className="form-control" id="deposit" required onChange={this.handleChange} placeholder="Deposit Amount" />
                                </InputGroup>
                                <Button variant="warning" onClick={this.makeBid(listing.auction_id, listing.type)}>Place Bid</Button>
                              </div>
                            }
                          </>
                          :
                          (status === 'Bidding Over') ?
                            <>
                              {listing.bidplaced === true ?
                                <Button variant="info" onClick={this.revealBid(listing.auction_id, listing.type)}>Reveal Bid</Button>
                                :
                                <Button variant="warning" disabled>Bidding Time Over</Button>
                              }
                            </>
                            :
                            (status === 'Ended') ?
                              <>
                                {listing.bidplaced === true ?
                                  <Button variant="info" onClick={this.withdrawDeposit(listing.auction_id, listing.type)}>Withdraw Bid</Button>
                                  :
                                  <Button variant="warning" disabled>Auction Ended</Button>
                                }
                              </>
                              :
                              <> </>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </div>
      </>
    );
  }
}

export default MarketPlace;