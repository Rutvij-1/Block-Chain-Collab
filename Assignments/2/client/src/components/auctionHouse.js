import React, { Component } from 'react'
import { Table, Button, InputGroup } from 'react-bootstrap';
import { get_secret, getPublicKey, getPrivateKey } from "../pub_pvt";
import EthCrypto from "eth-crypto";
class AuctionHouse extends Component {
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
      formData: {},
    }
    this.handleChange = this.handleChange.bind(this);
    this.makeBid = this.makeBid.bind(this);
    this.endAuction = this.endAuction.bind(this);
    this.sellItem = this.sellItem.bind(this);
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
        market: this.props.market,
        web3: this.props.web3,
        currentAccount: this.props.account
      });
			let offSet = 1000;
			let marketListings = await this.props.market.methods.fetchactivelistings().call({ from: this.props.account });
      for (let i = 0; i < marketListings.length; ++i) {
				console.log(i);
          marketListings[i]["type"] = "Normal Listing";
          marketListings[i]["new_auction_id"] = parseInt(marketListings[i]["auction_id"]) + offSet;
          marketListings[i]["bidding_deadline"] = "NA";
          marketListings[i]["reveal_deadline"] = "NA";
      }
      offSet += marketListings.length;
      let blindAuctions = await this.props.blind_contract.methods.getactiveauctions().call({ from: this.props.account });
      for (let i = 0; i < blindAuctions.length; ++i) {
        console.log(blindAuctions[i]["ended"]);
        blindAuctions[i]["type"] = "Blind Auction";
        blindAuctions[i]["new_auction_id"] = parseInt(blindAuctions[i]["auction_id"]) + offSet;
        blindAuctions[i]["bidding_deadline"] = new Date(blindAuctions[i]["biddingEnd"] * 1000);
        blindAuctions[i]["reveal_deadline"] = new Date(blindAuctions[i]["revealEnd"] * 1000);
      }
      offSet += blindAuctions.length;
      let vikreyAuctions = await this.props.vickrey_contract.methods.getactiveauctions().call({ from: this.props.account });
      for (let i = 0; i < vikreyAuctions.length; ++i) {
        vikreyAuctions[i]["type"] = "Vikrey Auction";
        vikreyAuctions[i]["new_auction_id"] = parseInt(vikreyAuctions[i]["auction_id"]) + offSet;
        vikreyAuctions[i]["bidding_deadline"] = new Date(vikreyAuctions[i]["biddingEnd"] * 1000);
        vikreyAuctions[i]["reveal_deadline"] = new Date(vikreyAuctions[i]["revealEnd"] * 1000);
      }
      // let auctions = blindAuctions.concat(vikreyAuctions);
      offSet += vikreyAuctions.length;
      let averageAuctions = await this.props.average_contract.methods.getactiveauctions().call({ from: this.props.account });
      for (let i = 0; i < averageAuctions.length; ++i) {
        averageAuctions[i]["type"] = "Average Price Auction";
        averageAuctions[i]["new_auction_id"] = parseInt(averageAuctions[i]["auction_id"]) + offSet;
        averageAuctions[i]["bidding_deadline"] = new Date(averageAuctions[i]["biddingEnd"] * 1000);
        averageAuctions[i]["reveal_deadline"] = new Date(averageAuctions[i]["revealEnd"] * 1000);
      }
      offSet += averageAuctions.length;
      let auctions = [].concat(marketListings, blindAuctions, vikreyAuctions, averageAuctions);
      this.setState({ listings: auctions });

    } catch (error) {
      alert(`Loading...`);
    }
  };

	sellItem = (auction_id) => async (e) => {
    e.preventDefault();
		const accounts = await this.state.web3.eth.getAccounts();
    this.setState({ accounts, currentAccount: accounts[0] });
		let marketListings = await this.props.market.methods.fetchalllistings().call({ from: accounts[0] });
		let pubkey = await getPublicKey(marketListings[auction_id].buyer);
		let secr = await get_secret(pubkey, this.state.formData.unique_string);
		let res = await this.state.market.methods.sellIstem(auction_id,secr).send({from: this.state.currentAccount});
		let sent_string = await res.logs[0].args.H;
		this.props.set_string(sent_string);
		console.log(sent_string);
	};

	buyItem = (auction_id) => async (e) => {
    e.preventDefault();
		const accounts = await this.state.web3.eth.getAccounts();
    this.setState({ accounts, currentAccount: accounts[0] });
		let pubkey = await getPublicKey(this.state.currentAccount);
		try{
			let res = await this.state.market.methods.requestBuy(auction_id,pubkey).send({ from: accounts[0] });
			window.location.reload(false);
		} catch(error){
			alert(`error`);
		}
	};

	confirm = (auction_id) => async (e) => {
    e.preventDefault();
		const accounts = await this.state.web3.eth.getAccounts();
    this.setState({ accounts, currentAccount: accounts[0] });
		try{
			await this.state.market.methods.confirmDelivery(auction_id).send({ from: accounts[0] });
			let cipher = EthCrypto.cipher.parse(this.props.stringvalue);
			//decrypt using the private key offchain
			let buyer_private_key = await getPrivateKey(this.state.currentAccount);
			try{
				let sent_item = await EthCrypto.decryptWithPrivateKey(buyer_private_key, cipher);
			} catch(err){
				alert(`Wrong key`);
			}
		} catch(error){
			alert(`error`);
		}
	};

  makeBid = (auction_id, type) => async (e) => {
    e.preventDefault();
		const accounts = await this.state.web3.eth.getAccounts();
    this.setState({ accounts, currentAccount: accounts[0] });
    const { value, secret_key, deposit } = this.state.formData;
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
          parseInt(auction_id)
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
          parseInt(auction_id)
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
          parseInt(auction_id)
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

  endAuction = (auction_id, type) => async (e) => {
    e.preventDefault();
    const accounts = await this.state.web3.eth.getAccounts();
    this.setState({ accounts, currentAccount: accounts[0] });
		const { blind_contract, vickrey_contract, average_contract } = this.state;
    try {
      if (type === "Blind Auction") {
        await blind_contract.methods.auctionEnd(
          parseInt(auction_id)
        ).send({
          from: this.state.currentAccount
        });
      } else if (type === "Vikrey Auction") {
        await vickrey_contract.methods.auctionEnd(
          parseInt(auction_id)
        ).send({
          from: this.state.currentAccount
        });
      } else {
        await average_contract.methods.auctionEnd(
          parseInt(auction_id)
        ).send({
          from: this.state.currentAccount
        });
      }
      window.location.reload(false);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  revealBid = (auction_id, type) => async (e) => {
    e.preventDefault();
    const accounts = await this.state.web3.eth.getAccounts();
    this.setState({ accounts, currentAccount: accounts[0] });
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
				<h2>The active listings are:</h2>
				<br/>
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
								<td>Item Price</td>
								<td>Bidding Deadline</td>
								<td>Bid Reveal Deadline</td>
								<td>Manage</td>
							</tr>
						</thead>
						<tbody>
							{this.state.listings.map(listing => {
								let status = 'Active'
								let type = "Normal"
								if(listing.type!="Normal Listing"){
									type = "Not"
								}
                if(Date.now() > listing.bidding_deadline) {
                  status = 'Bidding Over'
                }
                if (Date.now() > listing.reveal_deadline) {
                  status = 'Reveal Time Over'
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
                      {listing.beneficiary === this.state.currentAccount ?
											(type === "Normal")?
												(status === 'Ended')?
													<p>Auction Ended Successfully. <br/> Buyer: {listing.buyer? listing.buyer: "None"} <br/> Selling Price: {listing.price}</p>
													:
													<>
														<input type="string" className="form-control" id="unique_string" required onChange={this.handleChange} placeholder="Unique String" />
														<Button variant="success" onClick={this.sellItem(listing.auction_id)}>Sell Item</Button>
													</>
												:
                        (status === 'Reveal Time Over') ?
                          <Button onClick={this.endAuction(listing.new_auction_id, listing.type)} variant="danger">End Auction</Button>
                          :
                          <Button variant="outline-success" disabled>Active</Button>
                        :
												(type === "Normal")?
													(status === 'Active') ?
													<Button variant="primary" onClick={this.buyItem(listing.auction_id, listing.type)}>Buy</Button>
													:
													(status === 'Requested') ?
													<Button variant="info" disabled>Requested to Buy</Button>
													:
													(status === 'Sold') ?
													<Button variant="primary" onClick={this.confirm(listing.auction_id)}>Confirm Checkout</Button>
													:
													<Button variant="outline-success" disabled>Delivered</Button>
												:
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
                                  <input type="number" className="form-control" id="deposit" required onChange={this.handleChange} placeholder="Deposit Amount" />
                                </InputGroup>
                                <Button variant="primary" onClick={this.makeBid(listing.auction_id, listing.type)}>Place Bid</Button>
                              </div>
                            }
                          </>
                          :
                          (status === 'Bidding Over') ?
                            <>

                              {listing.bidplaced === true ?
                                listing.revealed ?
                                  <Button variant="info" disabled>Revealed</Button>
                                  :
                                  <>
                                    <InputGroup>
                                      <input type="number" className="form-control" id="value" required onChange={this.handleChange} placeholder="Bid Amount" />
                                      <input type="password" className="form-control" id="secret_key" required onChange={this.handleChange} placeholder="Secret Key" />
                                    </InputGroup>
                                    <Button variant="info" onClick={this.revealBid(listing.auction_id, listing.type)}>Reveal Bid</Button>
                                  </>
                                :
                                <Button variant="danger" disabled>Bidding Time Over</Button>
                              }
                            </>
                            :
                            (status === 'Reveal Time Over') ?
                              <Button variant="danger" disabled>Reveal Time Over. <br />Wait for auction end.</Button>
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

export default AuctionHouse;