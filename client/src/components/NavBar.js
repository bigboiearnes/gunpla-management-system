import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { fetchUserAuth } from './FetchUserAuth';
import './NavBar.css';

export default function NavBar() {
  const { token, logout } = useAuth(); 
  const [username, setUsername] = useState(null)

  useEffect(() => {
    // Perform when a token exists (the user has logged in)
    const checkTokenValidity = async () => {
      try {
        await axios.get('/api/user/check-token', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        if (error.response && error.response.status === 403) {
          // Token is invalid or expired, log out the user
          logout();
        }
      }
    };

    if (token) {
      checkTokenValidity();
      if (token) {
        fetchUserData(token);
      }
    }
  }, [token, logout]);

  const fetchUserData = async (token) => {
    try {
      const userData = await fetchUserAuth(token);
      setUsername(userData.username);
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  };


  return (
    <div className='nav-bar-container'>
      <NavLink to='/'>
      <img
       src='https://i.ibb.co/pzGgbcc/logo192.png' 
       alt='GUNPLA MANAGEMENT SYSTEM' 
       className='website-title' />
       </NavLink>
      <nav className='nav-bar-navs'>
        <NavLink to="/search">
          <img 
            src='https://i.ibb.co/1TFx9t8/Search.jpg'
            alt='Search'
            className='nav-search-icon'
          />
        </NavLink>
      </nav>
      {token ? ( // Check if user is logged in
        <nav className='nav-bar-profile-nav'>
          <NavLink to={`/profile/${username}`}>Profile</NavLink> 
          <NavLink to={`/collection/${username}`}>
            <img 
              src='https://i.ibb.co/dBrR3sk/Collection.jpg'
              alt='Collection'
              className='nav-collection-icon'
            />
          </NavLink>
        </nav>
      ) : (
        <nav className='nav-bar-profile-nav'>
          <NavLink to="/register">Register</NavLink>
          <NavLink to="/login">Log In</NavLink>
        </nav>
      )}
    </div>
  );
}

