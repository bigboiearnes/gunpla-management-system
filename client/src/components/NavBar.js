import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      // Navigate to the kit page with the entered kitId
      window.location.href = `/database/${searchInput}`;
    }
  };

  return (
    <div className='nav-bar-container'>
      <h1 className='website-title'>Gunpla Management System</h1>
      <nav className='nav-bar-navs'>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/database/HG01">Example Kit</NavLink>
        {/* Add more navigation links as needed */}
      </nav>
      <input
        type="text"
        placeholder="Search"
        className='nav-bar-search-bar'
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyPress={handleSearch}
      />
    </div>
  );
}

