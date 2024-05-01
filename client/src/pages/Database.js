import React from 'react';
import { useParams } from 'react-router-dom';
import useFetchKit from '../components/FetchKits';
import { useAuth } from '../components/AuthContext';
import './Database.css';

export default function Database(){
  const { kitId } = useParams();
  const { kit, loading, error } = useFetchKit(kitId);
  const { token } = useAuth();

  const handleAddToCollection = () => {
    if (!token) {
        alert('You need to log in to perform this action')
    } else {
        alert('You are logged in but this button does nothing!')
        console.log(token)
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
      <div class='kit-page-head'>
        <h1 class='kit-name'>{kit.kitName}</h1>
        <img className='kit-box-art' src={kit.boxArt} alt={kit.kitName}></img>
        <h3 class='kit-model'>{kit.kitGrade}</h3>
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
          Add to collection
          </button>
          <select className='collection-rating-select'>
            <option selected="selected" value={0}>Select Rating</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
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
