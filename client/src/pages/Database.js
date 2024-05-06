import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import useFetchKit from '../components/FetchKits';
import { useAuth } from '../components/AuthContext';
import { fetchUserAuth } from '../components/FetchUserAuth';
import './Database.css';
import getTimelineFromKitID from '../components/GetTimelineFromKitID';

let didInit = false;

export default function Database(){
  const { kitId } = useParams();
  const { kit, loading, error } = useFetchKit(kitId);
  
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [kitInCollection, setKitInCollection] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);

  // Page load handler
  useEffect(() => {
    if (!didInit) {
      didInit = true;
  
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
    }
  }, [token]);

  useEffect(() => {
    const checkKitInCollection = async () => {
      try {

        const response = await fetch(`/api/user/collection/${user.username}`);

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const userCollection = await response.json();

        if (userCollection.collection.some(item => item.kitId === kitId)) {
          setKitInCollection(true);
        }
      } catch (error) {
        console.error('Error checking if kit is in collection:', error);
      } 
    };

    if (user) {
      checkKitInCollection(user);
    }
  }, [user, kitId]);

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
      const response = await axios.post('/api/user/collection', payload, {
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

  if (!kit.timeline) {
      kit.timeline = getTimelineFromKitID(kit.kitId);
  }

  return (
    <div className='database-kit-page-wrapper'>
      <div className='database-kit-page-head'>
        <h1 className='database-kit-name'>{kit.kitName}</h1>
        <img className='database-kit-box-art' src={kit.boxArt} alt={kit.kitName}></img>
        <h3 className='database-kit-model'>{kit.kitGrade}</h3>
        <h3 className='database-kit-model'>Suit Model: {kit.gundamModel}</h3>
        <h3 className='database-kit-model'>Timeline: {kit.timeline}</h3>
        <h3 className='database-kit-model'>Scale: {kit.scale}</h3>
        <h3 className='database-kit-model'>Runners: {kit.runnerNum}</h3>
        <h3 className='database-kit-model'>Release Date: {kit.releaseMonth}/{kit.releaseYear}</h3>
        <h3 className='database-it-model'>GMS ID: {kit.kitId}</h3>
      </div>
      <div className='database-kit-content-wrapper'>

          
          <div className='database-collection-wrapper'>
          <button 
          className='database-add-to-collection-button' 
          onClick={handleAddToCollection}>
          {kitInCollection ? 'Update collection' : 'Add to collection'}
          </button>
          <select 
          className='database-collection-rating-select'
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
          className='database-collection-status-select'
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value={3}>Select Status</option>
            <option value={1}>Built</option>
            <option value={2}>Owned</option>
            <option value={3}>Want</option>
          </select>
          </div>

          <div className='database-biography-wrapper'>
            <p className='database-kit-biography'>{kit.biography}</p>
          </div>

          {kit && kit.accessories && (
            <div className='database-kit-accessories-list'>
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
