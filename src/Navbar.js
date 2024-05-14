import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; 

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-items">
      {/* <Link to="/products" className="nav-link">Products</Link> */}
        <a href="/stores" className="nav-link">Stores</a>
        <a href="/vendors" className="nav-link">Vendors</a>
        <button className="logout-button">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
