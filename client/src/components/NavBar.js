import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { fetchUserAuth } from './FetchUserAuth';
import './NavBar.css';

export default function NavBar() {
  const { token } = useAuth(); 
  const [searchInput, setSearchInput] = useState('');
  const [username, setUsername] = useState(null)

  useEffect(() => {
    if (token) {
      fetchUserData(token);
    }
  }, [token]);

  const fetchUserData = async (token) => {
    try {
      const userData = await fetchUserAuth(token);
      setUsername(userData.username);
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  };


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
        <NavLink to="/database/HG01">Example Kit</NavLink>
        <NavLink to="/database/HG01">Example Kit</NavLink>
      </nav>
      <input
        type="text"
        placeholder="Search"
        className='nav-bar-search-bar'
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyPress={handleSearch}
      />
      {token ? ( // Check if user is logged in
        <nav className='nav-bar-profile-nav'>
          <NavLink to={`/profile/${username}`}>Profile</NavLink> 
        </nav>
      ) : (
        <nav className='nav-bar-login-navs'>
          <NavLink to="/register">Register</NavLink>
          <NavLink to="/login">Log In</NavLink>
        </nav>
      )}
    </div>
  );
}

