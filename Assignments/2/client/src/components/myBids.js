import React, { Component } from 'react'
import { Table, Button, InputGroup } from 'react-bootstrap';
import {getPublicKey, getPrivateKey } from "../pub_pvt";
import EthCrypto from "eth-crypto";

class MyBids extends Component {
  constructor(props) {
    super(props)
    this.state = {
			web3: null,
      accounts: null,
      currentAccount: null,
      market: null,
      blind_contract: null,
      vickrey_contract: null,
      average_contract: null,
      listings: [],
      makebid: false,
      formData: {}
    }
    this.handleChange = this.handleChange.bind(this);
    this.makeBid = this.makeBid.bind(this);
    this.confirm = this.confirm.bind(this);
    this.buyItem = this.buyItem.bind(this);
    this.revealBid = this.revealBid.bind(this);
  }
  componentDidMount = async () => {
    try {
      this.setState({
        vickrey_contract: this.props.vickrey_contract,
        blind_contract: this.props.blind_contract,
        average_contract: this.props.average_contract,
        web3: this.props.web3,
        currentAccount: this.props.account,
				market: this.props.market
      });
      let mylist = [];
      let offSet = 1000;
      let marketListings = await this.props.market.methods.fetchalllistings().call({ from: this.props.account });
      for (let i = 0; i < marketListings.length; ++i) {
        if (marketListings[i]["buyer"] == this.props.account) {
          marketListings[i]["type"] = "Normal Listing";
          marketListings[i]["new_auction_id"] = parseInt(marketListings[i]["auction_id"]) + offSet;
          marketListings[i]["bidding_deadline"] = "NA";
          marketListings[i]["reveal_deadline"] = "NA";
          mylist.push(marketListings[i]);
        }
      }

      offSet += mylist.length;
			let blindAuctions = await this.props.blind_contract.methods.getallauctions().call({ from: this.props.account });
      for (let i = 0; i < blindAuctions.length; ++i) {
        if (blindAuctions[i]["bidplaced"]) {
          blindAuctions[i]["type"] = "Blind Auction";
          blindAuctions[i]["new_auction_id"] = parseInt(blindAuctions[i]["auction_id"]) + offSet;
          blindAuctions[i]["bidding_deadline"] = new Date(blindAuctions[i]["biddingEnd"] * 1000);
          blindAuctions[i]["reveal_deadline"] = new Date(blindAuctions[i]["revealEnd"] * 1000);
          mylist.push(blindAuctions[i]);
        }
      }
      offSet += mylist.length;
      let vikreyAuctions = await this.props.vickrey_contract.methods.getallauctions().call({ from: this.props.account });
      for (let i = 0; i < vikreyAuctions.length; ++i) {
        if (vikreyAuctions[i]["bidplaced"]) {
          vikreyAuctions[i]["type"] = "Vikrey Auction";
          vikreyAuctions[i]["new_auction_id"] = parseInt(vikreyAuctions[i]["auction_id"]) + offSet;
          vikreyAuctions[i]["bidding_deadline"] = new Date(vikreyAuctions[i]["biddingEnd"] * 1000);
          vikreyAuctions[i]["reveal_deadline"] = new Date(vikreyAuctions[i]["revealEnd"] * 1000);
          mylist.push(vikreyAuctions[i]);
        }
      }
      // let auctions = blindAuctions.concat(vikreyAuctions);
      offSet += mylist.length;
      let averageAuctions = await this.props.average_contract.methods.getallauctions().call({ from: this.props.account });
      for (let i = 0; i < averageAuctions.length; ++i) {
        if (averageAuctions[i]["bidplaced"]) {
          averageAuctions[i]["type"] = "Average Price Auction";
          averageAuctions[i]["new_auction_id"] = parseInt(averageAuctions[i]["auction_id"]) + offSet;
          averageAuctions[i]["bidding_deadline"] = new Date(averageAuctions[i]["biddingEnd"] * 1000);
          averageAuctions[i]["reveal_deadline"] = new Date(averageAuctions[i]["revealEnd"] * 1000);
          mylist.push(averageAuctions[i]);
        }
      }
      offSet += averageAuctions.length;
      this.setState({ listings: mylist });

    } catch (error) {
      alert(`Loading...`);
		}
  };

	buyItem = (auction_id) => async (e) => {
    e.preventDefault();
		let pubkey = await getPublicKey(this.state.currentAccount);
		try{
			let res = await this.state.market.methods.requestBuy(auction_id,pubkey).send({ from: this.props.account });
			window.location.reload(false);
		} catch(error){
			alert(`error`);
		}
	};

	confirm = (auction_id, type) => async (e) => {
    e.preventDefault();
    const { market, blind_contract, vickrey_contract, average_contract, currentAccount } = this.state
		try{
      if (type === "Normal Listing") {
        await market.methods.confirmDelivery(auction_id).send({ from: currentAccount });
        let cipher = EthCrypto.cipher.parse(this.props.stringvalue);
        //decrypt using the private key offchain
        let buyer_private_key = await getPrivateKey(currentAccount);
        try{
          let sent_item = await EthCrypto.decryptWithPrivateKey(buyer_private_key, cipher);
          console.log(sent_item);
        } catch(err){
          alert(`Wrong key`);
        }
      }
      else if (type === "Blind Auction") {
        await blind_contract.methods.confirmDelivery(auction_id).send({ from: currentAccount });
        let cipher = EthCrypto.cipher.parse(this.props.stringvalue);
        //decrypt using the private key offchain
        
        let buyer_private_key = await getPrivateKey(currentAccount);
        try{
          let sent_item = await EthCrypto.decryptWithPrivateKey(buyer_private_key, cipher);
          console.log(sent_item);
        } catch(err){
          alert(`Wrong key`);
        }
      } else if (type === "Vikrey Auction") {
        await vickrey_contract.methods.confirmDelivery(auction_id).send({ from: currentAccount });
        let cipher = EthCrypto.cipher.parse(this.props.stringvalue);
        //decrypt using the private key offchain
        let buyer_private_key = await getPrivateKey(currentAccount);
        try{
          let sent_item = await EthCrypto.decryptWithPrivateKey(buyer_private_key, cipher);
          console.log(sent_item);
        } catch(err){
          alert(`Wrong key`);
        }
      } else {
        await average_contract.methods.confirmDelivery(auction_id).send({ from: currentAccount });
        let cipher = EthCrypto.cipher.parse(this.props.stringvalue);
        //decrypt using the private key offchain
        let buyer_private_key = await getPrivateKey(currentAccount);
        try{
          let sent_item = await EthCrypto.decryptWithPrivateKey(buyer_private_key, cipher);
          console.log(sent_item);
        } catch(err){
          alert(`Wrong key`);
        }
      }
			
		} catch(error){
			alert(`Error! Could not confirm.`);
		}
	};

  makeBid = (auction_id, type) => async (e) => {
    e.preventDefault();
    const { value, secret_key, deposit, publickey } = this.state.formData;
    const { blind_contract, vickrey_contract, average_contract, currentAccount, web3 } = this.state
    this.setState({ makebid: !this.state.makebid });
    try {
      if (type === "Blind Auction") {
        await blind_contract.methods.bid(
          web3.utils.keccak256(
            web3.eth.abi.encodeParameters(
              ["uint256", "string"],
              [value, secret_key]
            )
          ),
          parseInt(auction_id),
          publickey
        ).send({
          from: currentAccount,
          value: deposit
        });
      } else if (type === "Vikrey Auction") {
        await vickrey_contract.methods.bid(
          web3.utils.keccak256(
            web3.eth.abi.encodeParameters(
              ["uint256", "string"],
              [value, secret_key]
            )
          ),
          parseInt(auction_id),
          publickey
          ).send({
          from: currentAccount,
          value: deposit
        });
      } else {
        await average_contract.methods.bid(
          web3.utils.keccak256(
            web3.eth.abi.encodeParameters(
              ["uint256", "string"],
              [value, secret_key]
            )
          ),
          parseInt(auction_id),
          publickey
        ).send({
          from: currentAccount,
          value: deposit
        });
      }
			window.location.reload(false);
    } catch (error) {
			alert(`Error: ${error.message}`);
    }
  }

  revealBid = (auction_id, type) => async (e) => {
    e.preventDefault();
    const { value, secret_key } = this.state.formData;
    const { blind_contract, vickrey_contract, average_contract, web3, currentAccount } = this.state
    try {
      if (type === "Blind Auction") {
        await blind_contract.methods.reveal(
          value,
          secret_key,
          parseInt(auction_id)
        ).send({
          from: currentAccount
        });
      } else if (type === "Vikrey Auction") {
        await vickrey_contract.methods.reveal(
          value,
          secret_key,
          parseInt(auction_id)
        ).send({
          from: currentAccount
        });
      } else {
        await average_contract.methods.reveal(
          value,
          secret_key,
          parseInt(auction_id)
        ).send({
          from: currentAccount
        });
      }
			window.location.reload(false);
    } catch (error) {
			alert(`Error: ${error.message}`);
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
        <h2>My Bids</h2>
        <br />
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <td>Listing ID</td>
                <td>Listing Type</td>
                <td>Item Name</td>
                <td>Item Description</td>
                <td>Item Price</td>
                <td>Bidding Deadline</td>
                <td>Bid Reveal Deadline</td>
                <td>Manage</td>
              </tr>
            </thead>
            <tbody>
              {this.state.listings.map(listing => {
                let status = 'Active'
                if (listing.type != "Normal Listing" && Date.now() > listing.bidding_deadline) {
                  status = 'Bidding Over'
                }
                if (listing.type != "Normal Listing" && Date.now() > listing.reveal_deadline) {
                  status = 'Reveal Time Over'
                }
                if (listing.ended) {
                  status = 'Ended'
                }
								if(listing.type === "Normal Listing" && listing.buyer_alloted) {
									status = 'Requested'
								}
								if(listing.type === "Normal Listing" && listing.sold_or_withdrawn) {
									status = 'Sold'
								}
                return (
                  <tr key={listing.new_auction_id}>
                    <td>{listing.new_auction_id}</td>
                    <td>{listing.type}</td>
                    <td>{listing.item_name}</td>
                    <td>{listing.item_description}</td>
										<td>{listing.type!="Normal Listing" ? "NA": listing.price}</td>
                    <td>{listing.type!="Normal Listing" ? listing.bidding_deadline.toTimeString(): listing.bidding_deadline}</td>
                    <td>{listing.type!="Normal Listing" ? listing.reveal_deadline.toTimeString(): listing.reveal_deadline}</td>
                    <td>
                      { listing.type === "Normal Listing" ?
											(status === 'Active') ?
											<Button variant="primary" onClick={this.buyItem(listing.auction_id, listing.type)}>Buy</Button>
											:
											(status === 'Requested') ?
											<Button variant="info" disabled>Requested to Buy</Button>
											:
											(status === 'Sold') ?
											<Button variant="primary" onClick={this.confirm(listing.auction_id, listing.type)}>Confirm Delivery</Button>
											:
											<Button variant="outline-success" disabled>Delivered</Button>
											:
											// Auction Item
											(status === 'Active') ?
                        <>
                          {listing.bidplaced === true ?
                            <div>
                              <Button variant="info" disabled>Bid Already Placed</Button>
                            </div>
                            :
                            <div>
                              <InputGroup>
                                <input type="number" className="form-control" id="value" required onChange={this.handleChange} placeholder="Bid Amount" />
                                <input type="password" className="form-control" id="secret_key" required onChange={this.handleChange} placeholder="Secret Key" />
                              </InputGroup>
                              <InputGroup>
                                <input type="number" className="form-control" id="deposit" required onChange={this.handleChange} placeholder="Deposit Amount (>2*Bid Amount)" />
                                <input type="string" className="form-control" id="publickey" required onChange={this.handleChange} placeholder="Public Key" />
                              </InputGroup>
                              <Button variant="primary" onClick={this.makeBid(listing.auction_id, listing.type)}>Place Bid</Button>
                            </div>
                          }
                        </>
                        :
                        // Bidding Time ended
                        (status === 'Bidding Over') ?
                          <>
                            {listing.bidplaced === true ?
															listing.revealed?
                              <Button variant="info" disabled>Revealed</Button>
                              :
                              <>
                                <InputGroup>
                                  <input type="number" className="form-control" id="value" required onChange={this.handleChange} placeholder="Bid Amount" />
                                  <input type="password" className="form-control" id="secret_key" required onChange={this.handleChange} placeholder="Secret Key" />
                                </InputGroup>
                                <Button variant="primary" onClick={this.revealBid(listing.auction_id, listing.type)}>Reveal Bid</Button>
                              </>
															:
                              <Button variant="danger" disabled>Bidding Time Over</Button>
                            }
                          </>
                          :
                          // Auction reveal deadline
                          (status === 'Reveal Time Over') ?
                            <Button variant="danger" disabled>Reveal Time Over. <br/>Wait for auction end.</Button>
                            :
                            // Auction ended
                            (status === 'Ended') ?
                              <>
                                {listing.highestBidder === this.state.currentAccount ?
                                 <>
                                 <Button variant="success" disabled>Auction Won! <br/> 
																	Bid Price: {listing.finalBid>0?listing.finalBid:"NA"} </Button>
											            <Button variant="primary" onClick={this.confirm(listing.auction_id, listing.type)}>Confirm Delivery</Button>
                                  </>
                                  :
                                  <Button variant="info" disabled>Auction Ended. <br/>
																	Won by: {listing.winner?listing.winner:"None"} <br/>
																	Winning Bid: {listing.finalBid>0?listing.finalBid:"NA"}</Button>
                                }
                              </>
                              :
                              <> Wait for Auction End </>
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
export default MyBids;