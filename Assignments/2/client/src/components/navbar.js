import React, { useState } from "react";
// import { NavLink } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import "./navbar.css";

function NavBar() {
  const [click, setClick] = useState(false);

  const handleClick = () => setClick(!click);
  return (
    <>
    <Navbar bg="dark" variant="dark">
  <Container>
    <Navbar.Brand href="/">Tripple Auction</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="me-auto">
       
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>
    {/* <nav className="navbar">
        <div className="nav-container">
        <a className="nav-logo" href="/" target="_blank">Tripple Auction</a>
            <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
          <small><a className="nav-link" href="#"><span id="account"></span></a></small>
        </li>
      </ul>
    </nav> */}
      {/* <nav className="navbar">
        <div className="nav-container">
            <a className="nav-logo" href="/">
            Tripple Auction
            </a>
          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li className="nav-item">
              <a
                href="/" 
                activeClassName="active"
                className="nav-links"
                onClick={handleClick}
              >
                Marketplace
              </a>
            </li>
            <li className="nav-item">
              <a
                href="#" 
                activeClassName="active"
                className="nav-links"
                onClick={handleClick}
              >
                Auction
              </a>
            </li>
          </ul>
          <div className="nav-icon" onClick={handleClick}>
            <i className={click ? "fas fa-times" : "fas fa-bars"}></i>
          </div>
        </div>
      </nav> */}
    </>
  );
}

export default NavBar;