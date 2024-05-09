import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import Filter from "bad-words";
import axios from 'axios';


import useFetchKit from '../components/FetchKits';
import { useAuth } from '../components/AuthContext';
import { fetchUserAuth } from '../components/FetchUserAuth';

import getTimelineFromKitID from '../components/GetTimelineFromKitID';
import RemoveFromCollection from '../components/RemoveFromCollection';
import AddToCollection from '../components/AddToCollection';
import UserReviews from '../components/userReviews';

import './Database.css';

let didInit = false;

export default function Database(){
  const { kitId } = useParams();
  const { kit, loading, error } = useFetchKit(kitId);
  
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [kitInCollection, setKitInCollection] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [showAddTags, setShowAddTags] = useState(false);
  const [tagInput, setTagInput] = useState(null);
  const [tagWarningLabel, setTagWarningLabel] = useState('');
  const [relatedKits, setRelatedKits] = useState([]);

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
        const response = await fetch(`https://gunplamanagementsystemapi.azurewebsites.net/api/user/collection/fetch/${user.username}`);

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const userCollection = await response.json();

        if (userCollection.collection.some(item => {
          if (item.kitId === kitId) {
            setKitInCollection(true);
            setSelectedRating(item.rating);
            setSelectedStatus(item.status);
            return true; // Explicitly return true if condition is met
          }
          return false; // Explicitly return false if condition is not met
        })) {
          
        }
      } catch (error) {
        console.error('Error checking if kit is in collection:', error);
      } 
    };

    if (user) {
      checkKitInCollection(user);
    }

    // Fetch related kits
    const fetchRelatedKits = async () => {
      try {
        const response = await axios.get(`https://gunplamanagementsystemapi.azurewebsites.net/api/kits/related`, {
          params: {
            gundamModel: kit.gundamModel
          }
        });
        setRelatedKits(response.data);
      } catch (error) {
        console.error('Error fetching related kits:', error);
      }
    };

    if (kit) {
      fetchRelatedKits();
    }

  }, [user, kitId, kit]);

  const handleAddToCollection = async () => {
    await AddToCollection({ token, selectedStatus, selectedRating, kitId: kit.kitId })
    setKitInCollection(true);
  };

  const handleRemoveFromCollection = async () => {
    const confirm = window.confirm('Are you sure you want to remove this kit from your collection? This will delete any existing review for this kit!')
    if (confirm) {
      setKitInCollection(false) 
      setSelectedRating(0)
      setSelectedStatus(0)
      await RemoveFromCollection({ kitId: kit.kitId, token })
       
    }
     
  }

  const handleAddTag = async () => {
    try {
      const filter = new Filter();
      let tag = filter.clean(tagInput)
      if (tag === tagInput) {
        if (tag.length < 20) {
          tag = tag.toLowerCase();
          const response = await axios.post('https://gunplamanagementsystemapi.azurewebsites.net/api/kits/tag/add', { kitId, tag }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.data) {
            throw new Error('Failed to add tag')
          }
          window.location.reload();
        } else {
          setTagWarningLabel("Tag can not be longer than 20 characters!")
        }
      } else {
        setTagWarningLabel("Tag was filtered for profanity, please try again.")
      }

    } catch (error) {
      console.error('Error adding tag:', error)
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

  if (!kit.usersReviewed) {
    kit.usersReviewed = [];
  }

  if (!kit.userTags) {
    kit.userTags = [];
  }

  return (
      <div>
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
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
                <option value={9}>9</option>
                <option value={10}>10</option>
              </select>
              <select 
              className='database-collection-status-select'
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value={3}>Select Status</option>
                <option value={1}>Built</option>
                <option value={4}>Work In Progress</option>
                <option value={2}>Owned</option>
                <option value={3}>Want</option>
              </select>
              {kitInCollection && (
                <button onClick={() => handleRemoveFromCollection()}>Remove</button>
              )}
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
              <div className='database-kit-tag-list'>
                <h3>Tags:</h3>
                <p className='database-tag'>
                  {Object.entries(
                    kit.userTags.reduce((acc, curr) => {
                      acc[curr.tag] = (acc[curr.tag] || 0) + 1;
                      return acc;
                    }, {})
                  )
                    .sort(([, countA], [, countB]) => countB - countA) // Sort by count in descending order
                    .map(([tag, count]) => (
                      <span className='user-tag' key={tag}>
                        {tag} ({count})
                      </span>
                    ))}
                </p>
                { token &&
                  <div>
                <button 
                className='database-show-tags-button'
                onClick={() => setShowAddTags(!showAddTags)}>
                Add Tag</button>
                {showAddTags && (
                  <div className='add-tags-input-wrapper'>
                    <label>Add a tag for this kit. It can be anything from difficulty, to general descriptors</label>
                    <div>
                    <input 
                      className='add-tag-input'
                      placeholder='Tag'
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                    />
                    <button
                    className='add-tag-submit'
                    onClick={handleAddTag}>Submit</button>
                    </div>
                    <label 
                    value={tagWarningLabel}
                    onChange={(e) => setTagWarningLabel(e.target.value)}>
                      
                    </label>
                  </div>
                
                  )}
                </div>
                }
              </div>
              <div className="related-kits-wrapper">
                <h2>Related Kits:</h2>
                {relatedKits.length > 0 ? (
                  <ul>
                    {relatedKits.map((relatedKit, index) => (
                      // Check if the relatedKit's kitId is different from the current kit's kitId
                      relatedKit.kitId !== kit.kitId && (
                        <li key={index}>
                          <a href={`/database/${relatedKit.kitId}`}>{relatedKit.kitName} - {relatedKit.kitGrade} - {relatedKit.kitId}</a>
                        </li>
                      )
                    ))}
                  </ul>
                ) : (
                  <p>No related kits found.</p>
                )}
              </div>
          </div>
        </div>
        <UserReviews 
        selectedStatus={selectedStatus}
        selectedRating={selectedRating}
        kitId={kit.kitId} 
        reviewers={kit.usersReviewed} 
        token={token}></UserReviews>
    </div>
  );
};
