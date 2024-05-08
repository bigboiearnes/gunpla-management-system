import React, { useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useFetchUser from '../components/FetchUserData';
import { useAuth } from '../components/AuthContext';
import { fetchUserAuth } from '../components/FetchUserAuth';
import './Profile.css';
import FetchFriends from '../components/FetchFriends';
import useFetchUserCollection from '../components/FetchUserCollection';

let didInit = false

export default function Profile(){
  const { username } = useParams();
  let userArray = [username];
  const navigate = useNavigate();
  const { targetUser, loading, error } = useFetchUser(username);
  const { token, logout } = useAuth();
  const [currentUser, setCurrentUser] = useState(userArray);
  const [selectedImage, setSelectedImage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [biography, setBiography] = useState(targetUser ? targetUser.biography || '' : '');

  const { targetUser: userCollection, loading: collectionLoading, error: collectionError } = useFetchUserCollection(username);

  // Page load handler
  useEffect(() => {
    if (!didInit) {
      didInit = true
      const fetchUserData = async () => {
        // Use token to determine logged in user
        try {
          const userData = await fetchUserAuth(token);
          setCurrentUser(userData);
          setSelectedImage(targetUser.profilePicture || '');
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      if (token) {
        fetchUserData();
      }
    }
  });

  const handleImageChange = async (event) => {
    const selectedImage = event.target.value;
    // Send request to backend to update user's profile picture
    try {
      await axios.post('/api/user/profile-picture', { username: currentUser.username, profilePicture: selectedImage });
      // Update local state with selected image
      setSelectedImage(selectedImage);
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

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
    window.location.reload();
  };

  const handleNavigateToCollection = () => {
    navigate(`/collection/${targetUser.username}`);
  };

  return (
    <div>
    <div className='profile-page-wrapper'>
      <div className='profile-page-head'>
       <h1 className='profile-username'>{targetUser.username}</h1>
       { selectedImage && (
          <img src={selectedImage} alt="Profile" className="profile-picture" />
        )}
       { !selectedImage && (
        <img src={targetUser.profilePicture} alt="Profile" className="profile-picture" />
       )} 
       { usernamesMatch &&
        <div className='profile-image-pick'>
            <h2>Choose Profile Picture:</h2>
            <select value={selectedImage} onChange={handleImageChange}>
              <option value="">Select Image...</option>
              <option value="https://i.ibb.co/pzGgbcc/logo192.png">GMS</option>
              <option value="https://i.ibb.co/5x9crWk/char-burger.png">Char</option>
              <option value="https://i.ibb.co/tBp18Tc/amuro.jpg">Amuro</option>
              <option value="https://i.ibb.co/BN2bYw3/4738268.png">Gundam</option>
              {/* Add more options as needed */}
            </select>
          </div>
       }
       <p className='profile-register-date'>Register Date: {formattedDate}</p>
       <div className= 'profile-page-head-buttons'>
       <button onClick={handleNavigateToCollection}>Go to {targetUser.username}'s Collection</button>
       {usernamesMatch && (
          <button className='logout-button' onClick={handleLogout}>
            Log Out
          </button>
        )}
        </div>
        <div className='friends-list'>
        <FetchFriends 
        targetUser={targetUser.username} 
        username={currentUser.username} 
        token={token}/>
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
            {userCollection && userCollection.collection && userCollection.collection.length > 0 && (
              <div className='collection-images-wrapper'>
                <h2 className='image-header'>Collection Images</h2>
                <div className="profile-kit-images-row">
                    {userCollection.collection.map((collectionItem, index) => (
                        <div key={index} className="profile-kit-image-wrapper">
                            {/* Conditionally render the image link */}
                            {collectionItem.image && (
                                <a href={`/database/${collectionItem.kitId}`} className="profile-kit-link">
                                    <img className='collection-image' src={collectionItem.image} alt={collectionItem.kitId} />
                                </a>
                            )}
                        </div>
                    ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
      
    
    </div>
    </div>
  );
};
