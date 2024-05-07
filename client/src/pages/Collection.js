import { useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

import useFetchUserCollection from '../components/FetchUserCollection';
import KitDetails from '../components/KitDetails';
import RemoveFromCollection from '../components/RemoveFromCollection';
import './Collection.css'

export default function Collection(){
    const { username } = useParams();
    const { targetUser, loading, error } = useFetchUserCollection(username);
    const { token } = useAuth();


    const getStatusLabel = (status) => {
        switch (status) {
          case "1":
            return 'Built';
          case "2":
            return 'Owned';
          case "3":
            return 'Want';
          case "4":
            return 'Work In Progress'
          default:
            return 'Unknown';
        }
      };
    
    const getRatingLabel = (label) =>
      {
        if (label === 0) {
          return '';
        }
        else {
          return label;
        }
      }

      
    
    const handleRemoveFromCollection = async (collectionItem) => {
      const confirm = window.confirm('Are you sure you want to remove this kit from your collection? This will delete any existing review for this kit!')
      if (confirm) {
        await RemoveFromCollection({ kitId: collectionItem.kitId, token })
      }
      // Refresh the page to show updated information
      window.location.reload();  
    }

    if (!targetUser) {
        return <div className='collection-page-wrapper'>Collection not found</div>;
      }
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (error) {
        return <div className='collection-page-wrapper'>Error: {error.message}</div>;
    }

    return (
        <div className='collection-page-wrapper'>
            <div className='collection-head-wrapper'>
                <h1>{username}'s Collection</h1>
            </div>
            <div className='list-head'>
              <div className='collection-item'>
                <div className='list-head-kit-details'>
                  <KitDetails className="list-head-details-wrapper" />
                    
                </div>
                <div className='collection-item-stats-wrapper'>
                  <div className='collection-item-stats-status'>Status</div>
                  <div className='collection-item-stats-rating'>Rating</div>
                </div>
                <div className='collection-remove-button-wrapper' />
              </div>
            </div>

            {targetUser && targetUser.collection && (
            <div className='collection-content-wrapper'>
                {targetUser.collection.map((collectionItem, index) => (
                    <div className='collection-item' key={index}>
                        <KitDetails kitId={collectionItem.kitId} />
                        <div className='collection-item-stats-wrapper'>
                            <div className='collection-item-stats-status'>{getStatusLabel(collectionItem.status)}</div>
                            <div className='collection-item-stats-rating'>{getRatingLabel(collectionItem.rating)}</div>
                        </div>
                        <div className='collection-remove-button-wrapper'>
                        <button 
                        className='collection-remove-button'
                        onClick={() => handleRemoveFromCollection(collectionItem)}>
                        Remove
                        </button>
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>
    );
}