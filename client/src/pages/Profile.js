import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import useFetchUser from '../components/FetchUserData';
import { useAuth } from '../components/AuthContext';
import { fetchUserAuth } from '../components/FetchUserAuth';
import './Profile.css';

export default function Profile(){
  const { username } = useParams();
  const { targetUser, loading, error } = useFetchUser(username);
  const { token } = useAuth();
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
    return <div className='profile-page-wrapper'>Loading...</div>;
  }

  if (!currentUser) {
    return loading ? <div>Loading...</div> : null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className='profile-page-wrapper'>Error: {error.message}</div>;
  }

  // Checks if the user viewing the page is the same as the user logged in
  const usernamesMatch = targetUser.username === currentUser.username;

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
  
  const handleSubmit = () => {
    console.log('updated biography', biography)
  
    setEditMode(false);
  };



  return (
    <div className='profile-page-wrapper'>
      <div className='profile-page-head'>
       <h1 className='profile-username'>{targetUser.username}</h1>
       <p className='profile-register-date'>Register Date: {formattedDate}</p>
      </div>
      <div className='profile-page-content'>
        {/* Render biography or textbox based on editMode*/}
        {editMode ? (
          <div>
            <div className='button-wrapper'>
              <button onClick={handleSubmit}>Submit</button>
              {usernamesMatch && (
              <button className='edit-biography-button' onClick={handleToggleEditMode}>
                {editMode ? 'Cancel' : 'Edit Biography'}
              </button>
            )}
            </div>
            <div className='biography-box-wrapper'>
              <textarea 
                className='biography-edit-box' 
                value={biography} 
                onChange={handleBiographyChange}   
              />
            </div>
          </div>
          
        ) : (
          <div>
            <div className='button-wrapper'>
            {usernamesMatch && (
              <button className='edit-biography-button' onClick={handleToggleEditMode}>
                {editMode ? 'Cancel' : 'Edit Biography'}
              </button>
            )}
            </div>
            <div className='biography-box-wrapper'>
              <p className='biography-box'>{targetUser.biography}</p>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};
