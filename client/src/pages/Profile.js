import React, { useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useFetchUser from '../components/FetchUserData';
import { useAuth } from '../components/AuthContext';
import { fetchUserAuth } from '../components/FetchUserAuth';
import './Profile.css';

export default function Profile(){
  const { username } = useParams();
  const navigate = useNavigate();
  const { targetUser, loading, error } = useFetchUser(username);
  const { token, logout } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [biography, setBiography] = useState(targetUser ? targetUser.biography || '' : '');

  // Page load handler
  useEffect(() => {
    const fetchUserData = async () => {
      // Use token to determine logged in user
      try {
        const userData = await fetchUserAuth(token);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  

  if (!targetUser) {
    return <div className='profile-page-wrapper'>User not found</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className='profile-page-wrapper'>Error: {error.message}</div>;
  }

  // Checks if the user viewing the page is the same as the user logged in
  let usernamesMatch = false
  if (currentUser) {
    usernamesMatch = targetUser.username === currentUser.username;
  }

  // Format register date 
  const registerDate = new Date(targetUser.registerDate);
  const formattedDate = `${registerDate.getDate()}/${registerDate.getMonth() + 1}/${registerDate.getFullYear()}`;
  
  const handleToggleEditMode = () => {
    setBiography(targetUser.biography || '');
    setEditMode(prevEditMode => !prevEditMode);
  };
  
  const handleBiographyChange = e => {
    setBiography(e.target.value);
  };
  
  const handleSubmit = async () => {

    const payload = {
      username: targetUser.username,
      biography,
    }
    // Post details and authentication to API
    const response = await axios.post('/api/user/update', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data) {
      throw new Error('Failed to update collection');
    }

    // Alert user to successful operation
    alert('Biography updated successfully');
    // Refresh page to update data
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    navigate(`/`)
  };

  const handleNavigateToCollection = () => {
    navigate(`/collection/${targetUser.username}`);
  };

  return (
    <div>
    <div className='profile-page-wrapper'>
      <div className='profile-page-head'>
       <h1 className='profile-username'>{targetUser.username}</h1>
       <p className='profile-register-date'>Register Date: {formattedDate}</p>
       <div className= 'profile-page-head-buttons'>
       <button onClick={handleNavigateToCollection}>Go to {targetUser.username}'s Collection</button>
       {usernamesMatch && (
              <button className='logout-button' onClick={handleLogout}>
                Log Out
              </button>
            )}
            </div>
      </div>
      <div className='profile-page-content-wrapper'>
        {/* Render biography or textbox based on editMode*/}
        {editMode ? (
          <div className='profile-page-content'>
            <div className='profile-button-wrapper'>
              <button onClick={handleSubmit}>Submit</button>
              {usernamesMatch && (
              <button className='profile-edit-biography-button' onClick={handleToggleEditMode}>
                {editMode ? 'Cancel' : 'Edit Biography'}
              </button>
            )}
            </div>
            <div className='profile-biography-box-wrapper'>
              <textarea 
                className='profile-biography-edit-box' 
                value={biography} 
                onChange={handleBiographyChange}   
              />
            </div>
          </div>
          
        ) : (
          <div className='profile-page-content'>
            <div className='profile-button-wrapper'>
              {usernamesMatch && (
                <button className='profile-edit-biography-button' onClick={handleToggleEditMode}>
                  {editMode ? 'Cancel' : 'Edit Biography'}
                </button>
              )}
            </div>
            <div className='profile-biography-box-wrapper'>
              <p className='profile-biography-box'>{targetUser.biography}</p>
            </div>
            
          </div>
        )}
      </div>
    </div>
    </div>
  );
};
