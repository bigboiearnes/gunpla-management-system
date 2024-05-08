import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { fetchUserAuth } from './FetchUserAuth';
import './NavBar.css';

let didInit = false;

export default function NavBar() {
  const { token, logout } = useAuth(); 
  const [username, setUsername] = useState(null)
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showFriendRequests, setShowFriendRequests] = useState(false);

  useEffect(() => {
    if (!didInit) {
      didInit = true;
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

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axios.get(`/api/friends/requests/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPendingRequests(response.data);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    if (token && username) {
      fetchPendingRequests();
    }
  }, [token, username]);

  const handleAcceptRequest = async (sender) => {
    try {
      await axios.post('/api/friends/accept', {
        sender,
        receiver: username,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      // Remove the accepted request from the list
      setPendingRequests(pendingRequests.filter(request => request.sender !== sender));
      window.location.reload();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (sender) => {
    try {
      await axios.post('/api/friends/reject', {
        sender,
        receiver: username,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      // Remove the rejected request from the list
      setPendingRequests(pendingRequests.filter(request => request.sender !== sender));
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
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
      <nav className='nav-search-icon'>
        <NavLink to="/search">
          <img 
            src='https://i.ibb.co/1TFx9t8/Search.jpg'
            alt='Search'
            className='nav-search-icon'
          />
        </NavLink>
      </nav>
      {token ? ( // Check if user is logged in
        <div className='nav-bar-profile'>
          <nav className='nav-bar-profile-nav'>
            <NavLink to={`/collection/${username}`}>
              <img 
                src='https://i.ibb.co/dBrR3sk/Collection.jpg'
                alt='Collection'
                className='nav-collection-icon'
              />
            </NavLink>
            <div className="friend-request-dropdown">
            <button className='notification-button' onClick={() => setShowFriendRequests(!showFriendRequests)}>
              Notifications ({pendingRequests.length})
            </button>
            {showFriendRequests && pendingRequests.length > 0 &&(
              <div className="friend-request-dropdown-content">
                {pendingRequests.map((request, index) => (
                  <div key={index}>
                    <span>{request.sender}</span>
                    <button onClick={() => handleAcceptRequest(request.sender)}>Accept</button>
                    <button onClick={() => handleRejectRequest(request.sender)}>Reject</button>
                  </div>
                ))}
              </div>
            )}
            <NavLink to={`/profile/${username}`}>{username}</NavLink> 
          </div>
          </nav>
          
        </div>
      ) : (
        <nav className='nav-bar-profile-nav'>
          <NavLink to="/register">Register</NavLink>
          <NavLink to="/login">Log In</NavLink>
        </nav>
      )}
    </div>
  );
}

