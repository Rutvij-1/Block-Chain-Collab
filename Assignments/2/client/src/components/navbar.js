import React, { Component } from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import "./navbar.css";

class Navbr extends Component{
  constructor(props){
    super(props)
  }
  render() {
    return(
    <>
      <Navbar bg="dark" variant="dark" sticky="top">
      <Container>
        <Navbar.Brand href="/">Tripple Auction</Navbar.Brand>
          <Button variant="dark" className="justify-content-end" onClick={this.props.activeListings}> Auctions
          </Button>
          <Button variant="dark" className="justify-content-end" onClick={this.props.showcreate}> Create Auction
          </Button>
          <Button variant="dark" className="justify-content-end" onClick={this.props.showauctions}> My Auctions
          </Button>
          <Button variant="dark" className="justify-content-end" onClick={this.props.showbids}> My Bids
          </Button>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
      </Container>
      </Navbar>
    </>
    )
  }
}

export default Navbr;