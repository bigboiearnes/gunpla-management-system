import { useParams } from 'react-router-dom';
import useFetchUserCollection from '../components/FetchUserCollection';
import KitDetails from '../components/KitDetails';
import './Collection.css'

export default function Collection(){
    const { username } = useParams();
    const { targetUser, loading, error } = useFetchUserCollection(username);

    const getStatusLabel = (status) => {
        switch (status) {
          case "1":
            return 'Built';
          case "2":
            return 'Owned';
          case "3":
            return 'Want';
          default:
            return 'Unknown';
        }
      };
      

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
                  <div className="list-head-details-wrapper">
                    <p className='collection-kit-box-art'/>
                    <div className="collection-kit-details-text-wrapper">
                    <p  className="headcollection-kit-name">Kit Name</p>
                    <p className='collection-kit-release-date'></p>
                    </div>
                    <p className="collection-kit-grade">Grade</p>
                  </div>
                </div>
                <div className='collection-item-stats-wrapper'>
                  <div className='collection-item-stats-status'>Status</div>
                  <div className='collection-item-stats-rating'>Rating</div>
                </div>
              </div>
            </div>

            {targetUser && targetUser.collection && (
            <div className='collection-content-wrapper'>
                {targetUser.collection.map((collectionItem, index) => (
                    <div className='collection-item' key={index}>
                        <KitDetails kitId={collectionItem.kitId} />
                        <div className='collection-item-stats-wrapper'>
                            <div className='collection-item-stats-status'>{getStatusLabel(collectionItem.status)}</div>
                            <div className='collection-item-stats-rating'>{collectionItem.rating}</div>
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>
    );
}