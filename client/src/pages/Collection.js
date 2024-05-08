import { useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useState, useEffect } from 'react'; // Import useEffect
import { fetchUserAuth } from '../components/FetchUserAuth';
import axios from 'axios';

import useFetchUserCollection from '../components/FetchUserCollection';
import RemoveFromCollection from '../components/RemoveFromCollection';
import './Collection.css';

export default function Collection() {
    const { username } = useParams();
    let userArray = [username];
    const { targetUser, loading: userLoading, error: userError } = useFetchUserCollection(username);
    const { token } = useAuth();

    // State variables for sorting
    const [sortBy, setSortBy] = useState('default'); // default, name, id, status, rating, releaseDate
    const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
    const [kits, setKits] = useState([]); // State for storing kit details
    const [currentUser, setCurrentUser] = useState(userArray);
    const [showAddImageIndex, setShowAddImageIndex] = useState(-1); // Index of collection item for which "Add Image" is shown
    const [showImageIndex, setShowImageIndex] = useState(-1); // Index of collection item for which "Show Image" is shown
    const [imageUrl, setImageUrl] = useState(''); // State for storing the URL of the image to be added



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
    
    const getStatusLabel = (status) => {
        switch (status) {
            case "1":
                return 'Built';
            case "2":
                return 'Owned';
            case "3":
                return 'Want';
            case "4":
                return 'Work In Progress';
            default:
                return 'Want';
        }
    };

    const getRatingLabel = (label) => {
        if (label === 0) {
            return '';
        } else {
            return label;
        }
    };

    const handleRemoveFromCollection = async (collectionItem) => {
        const confirmRemove = window.confirm('Are you sure you want to remove this kit from your collection? This will delete any existing review for this kit!');
        if (confirmRemove) {
            await RemoveFromCollection({ kitId: collectionItem.kitId, token });
            // Refresh the page to show updated information
            window.location.reload();
        }
    };


    // Function to sort collection based on criteria and merge kit details
    const sortCollection = (collection, kits) => {
        const sortedCollection = [...collection]; // Create a copy of the collection array
        
         // Merge kit details into each item of sortedCollection
         sortedCollection.forEach((item, index) => {
          const kitDetail = kits.find(kit => kit.kitId === item.kitId);
          sortedCollection[index] = {
              ...item,
              kitName: kitDetail ? kitDetail.kitName : '', // Add kitName
              releaseYear: kitDetail ? kitDetail.releaseYear : '', // Add releaseYear
              releaseMonth: kitDetail ? kitDetail.releaseMonth : '', // Add releaseMonth
              kitGrade: kitDetail ? kitDetail.kitGrade : '', // Add kitGrade
              boxArt: kitDetail ? kitDetail.boxArt : '' // Add boxArt
          };
        });
        
        switch (sortBy) {
            case 'name':
                sortedCollection.sort((a, b) => a.kitName.localeCompare(b.kitName));
                break;
            case 'id':
                sortedCollection.sort((a, b) => a.kitId - b.kitId);
                break;
            case 'status':
                sortedCollection.sort((a, b) => a.status - b.status);
                break;
            case 'rating':
                sortedCollection.sort((a, b) => a.rating - b.rating);
                break;
            case 'releaseDate':
                sortedCollection.sort((a, b) => ((a.releaseYear * 12) + a.releaseMonth) - ((b.releaseYear * 12) + b.releaseMonth));
                break;
            default:
                break;
        }
        
       

        return sortedCollection;
    };

    useEffect(() => {
        // Fetch kit details for each kit in the collection
        if (targetUser && targetUser.collection) {
            const fetchKits = async () => {
                const kitDetails = await Promise.all(targetUser.collection.map(async (item) => {
                    try {
                        const response = await fetch(`/api/kits/${item.kitId}`);
                        if (!response.ok) {
                            throw new Error('Failed to fetch kit details');
                        }
                        const kit = await response.json();
                        return kit;
                    } catch (error) {
                        console.error('Error fetching kit details:', error);
                        return null;
                    }
                }));
                setKits(kitDetails.filter(Boolean)); // Filter out null values
            };
            fetchKits();
        }
    }, [targetUser]); // Trigger fetch when targetUser changes

    const handleAddImageSubmit = async (collectionItem) => {
      try {
          // Make POST request to add image
          await axios.post('/api/user/collection/add-image', {
              kitId: collectionItem.kitId,
              imageUrl: imageUrl
          },{
              headers: {
                Authorization: `Bearer ${token}`,
              },
          });

          // Clear input and close popup
          setImageUrl('');
          setShowAddImageIndex(-1);
      } catch (error) {
          console.error('Error adding image:', error);
          // Handle error
      }
    };

    if (!targetUser) {
        return <div className='collection-page-wrapper'>Collection not found</div>;
    }
    if (userLoading) {
        return <div>Loading...</div>;
    }

    if (userError) {
        return <div className='collection-page-wrapper'>Error: {userError.message}</div>;
    }

    let usernamesMatch = false
    if (currentUser) {
      usernamesMatch = targetUser.username === currentUser.username;
    }

    // Sort the collection based on current sorting criteria and order
    const sortedCollection = sortCollection(targetUser.collection.slice(), kits);

    // Reverse the collection if order is descending
    if (sortOrder === 'desc') {
        sortedCollection.reverse();
    }

    return (
        <div className='collection-page-wrapper'>
            <div className='collection-head-wrapper'>
                <h1>{username}'s Collection</h1>
                <div>
                <label htmlFor="sortBy">Sort By:</label>
                <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="default">Default</option>
                    <option value="name">Name</option>
                    <option value="id">ID</option>
                    <option value="status">Status</option>
                    <option value="rating">Rating</option>
                    <option value="releaseDate">Release Date</option>
                </select>

                <label htmlFor="sortOrder">Sort Order:</label>
                <select id="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>
            </div>
            {/* Add dropdown for selecting sorting criteria */}
            
            <div className='list-head'>
                <div className='collection-item'>
                    <div className='list-head-kit-details'>
                        <div className="list-head-details-wrapper">
                            <div className="collection-kit-details-wrapper">
                                <p className='collection-kit-box-art'></p>
                                <div className="collection-kit-details-text-wrapper">
                                    <p className="headcollection-kit-name">Kit Name</p>
                                </div>
                                <p className="collection-kitid">Kit ID</p>
                                <p className="collection-kit-grade">Grade</p>
                            </div>
                        </div>
                    </div>
                    <div className='collection-item-stats-wrapper'>
                        <div className='collection-item-stats-status'>Status</div>
                        <div className='collection-item-stats-rating'>Rating</div>
                    </div>
                    {usernamesMatch &&
                    <div className='collection-remove-button-wrapper' />
                    }
                </div>
            </div>

            {sortedCollection.map((collectionItem, index) => (
                <div className='collection-item' key={index}>
                    <div className="collection-kit-details-wrapper">
                        {/* Display kit details from merged data */}
                        <img className='collection-kit-box-art' src={collectionItem.boxArt} alt={collectionItem.kitName} />
                        <div className="collection-kit-details-text-wrapper">
                            <a href={`/database/${collectionItem.kitId}`} className="collection-kit-name">{collectionItem.kitName}</a>
                            <p className='collection-kit-release-date'>Release Date: {collectionItem.releaseMonth}/{collectionItem.releaseYear}</p>
                        </div>
                        {collectionItem.image &&
                        <button className='collection-show-add-image' onClick={() => setShowImageIndex(index)}>Show Image</button>
                        }
                        {showImageIndex === index &&
                        <div className='modal-overlay'>
                          <div className='modal-content'>  
                            <img className='collection-kit-build-image' src={collectionItem.image} alt='User Gunpla' />
                            <button className='collection-show-add-image' onClick={() => setShowImageIndex(-1)}>Close Image</button>
                          </div>
                        </div>
                        }
                        {usernamesMatch &&
                        <button className='collection-add-image' onClick={() => setShowAddImageIndex(index)}>Add Image</button>
                        }
                        <div>
                        {showAddImageIndex === index &&
                            <div className='modal-overlay'>
                                <div className='modal-content'>
                                    <div>
                                    <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}></input>
                                    <button onClick={() => handleAddImageSubmit(collectionItem)}>Submit</button>
                                    </div>
                                    <label>Add URL to embed image.</label>
                                    <button className='close-button' onClick={() => setShowAddImageIndex(-1)}>Close</button>
                                </div>
                            </div>
                        }

                        </div>
                        <p className="collection-kitid">{collectionItem.kitId}</p>
                        <p className="collection-kit-grade">{collectionItem.kitGrade}</p>
                    </div>
                    <div className='collection-item-stats-wrapper'>
                        <div className='collection-item-stats-status'>{getStatusLabel(collectionItem.status)}</div>
                        <div className='collection-item-stats-rating'>{getRatingLabel(collectionItem.rating)}</div>
                    </div>
                    {usernamesMatch &&
                      <div className='collection-remove-button-wrapper'>
                        <button className='collection-remove-button' onClick={() => handleRemoveFromCollection(collectionItem)}>Remove</button>
                    </div>
                    }
                </div>
            ))}
        </div>
    );
}
