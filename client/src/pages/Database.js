import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import useFetchKit from '../components/FetchKits';
import { useAuth } from '../components/AuthContext';
import { fetchUserAuth } from '../components/FetchUserAuth';
import './Database.css';

export default function Database(){
  const { kitId } = useParams();
  const { kit, loading, error } = useFetchKit(kitId);
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);

  // Page load handler
  useEffect(() => {
    const fetchUserData = async () => {
      // Use token to determine logged in user
      try {
        const userData = await fetchUserAuth(token);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  // Add to Collection button handler
  const handleAddToCollection = async () => {
    try {
      // If there is no current session, alert user and do nothing
      if (!token) {
          alert('You need to log in to perform this action')
          return;
      } 

      // If status is not picked, set as "Want"
      const statusToSend = selectedStatus === 0 ? 3 : selectedStatus;

      // Details to send to database
      const payload = {
        kitId,
        status: statusToSend,
        rating: selectedRating,
      };

      // Post details and authentication to API
      const response = await axios.post('http://localhost:4000/api/user/collection', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If there is no response send an error
      if (!response.data) {
        throw new Error('Failed to update collection');
      }

      // Alert user to successful operation
      alert('Collection updated successfully');      

      // If any unhandled errors occur, alert user
    } catch (error) {
      console.error('Error updating collection:', error);
      alert('Failed to update collection')
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!kit) {
    return <div>Kit not found</div>;
  }

  return (
    <div className='kit-page-wrapper'>
      <div className='kit-page-head'>
        <h1 className='kit-name'>{kit.kitName}</h1>
        <img className='kit-box-art' src={kit.boxArt} alt={kit.kitName}></img>
        <h3 className='kit-model'>{kit.kitGrade}</h3>
        <h3 className='kit-model'>Suit Model: {kit.gundamModel}</h3>
        <h3 className='kit-model'>Timeline: {kit.timeline}</h3>
        <h3 className='kit-model'>Scale: {kit.scale}</h3>
        <h3 className='kit-model'>Runners: {kit.runnerNum}</h3>
        <h3 className='kit-model'>Release Date: {kit.releaseMonth}/{kit.releaseYear}</h3>
        <h3 className='kit-model'>GMS ID: {kit.kitId}</h3>
      </div>
      <div className='kit-content-wrapper'>

          
          <div className='collection-wrapper'>
          <button 
          className='add-to-collection-button' 
          onClick={handleAddToCollection}>
          {user && user.collection && user.collection.includes(kitId) ? 'Update collection' : 'Add to collection'}
          </button>
          <select 
          className='collection-rating-select'
          value={selectedRating}
          onChange={(e) => setSelectedRating(e.target.value)}
          >
            <option value={0}>Select Rating</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
          <select 
          className='collection-status-select'
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value={3}>Select Status</option>
            <option value={1}>Built</option>
            <option value={2}>Owned</option>
            <option value={3}>Want</option>
          </select>
          </div>

          <div className='biography-wrapper'>
            <p className='kit-biography'>{kit.biography}</p>
          </div>

          {kit && kit.accessories && (
            <div className='kit-accessories-list'>
              <h3>Kit Accessories:</h3>
              <ul>
                {kit.accessories.map((accessory, index) => (
                  <li key={index}>{accessory}</li>
                ))}
              </ul>
            </div>
          )}
      </div>
    </div>
  );
};
