import React, { useState } from "react";
// import { NavLink } from "react-router-dom";
import "./navbar.css";

function NavBar() {
  const [click, setClick] = useState(false);

  const handleClick = () => setClick(!click);
  return (
    <>
    {/* <nav className="navbar">
        <div className="nav-container">
        <a className="nav-logo" href="/" target="_blank">Tripple Auction</a>
            <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
          <small><a className="nav-link" href="#"><span id="account"></span></a></small>
        </li>
      </ul>
    </nav> */}
      <nav className="navbar">
        <div className="nav-container">
            <a className="nav-logo" href="/">
            Tripple Auction
            <i className="fas fa-code"></i>
            </a>
          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li className="nav-item">
              <a
                href="/market" 
                activeClassName="active"
                className="nav-links"
                onClick={handleClick}
              >
                Marketplace
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/auction" 
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
      </nav>
    </>
  );
}

export default NavBar;