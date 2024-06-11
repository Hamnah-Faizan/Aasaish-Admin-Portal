import React from 'react';
import { Link } from 'react-router-dom';
import Logout from './Logout';
import './Navbar.css'; 

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-items">
        <Logout/>
      </div>
    </nav>
  );
}

export default Navbar;
