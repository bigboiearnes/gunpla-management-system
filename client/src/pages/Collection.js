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
            {targetUser && targetUser.collection && (
            <div className='collection-content-wrapper'>
                {targetUser.collection.map((collectionItem, index) => (
                    <div className='collection-item' key={index}>
                        <KitDetails kitId={collectionItem.kitId} />
                        <div className='collection-item-stats-wrapper'>
                            <div className='collection-item-stats'>{getStatusLabel(collectionItem.status)}</div>
                            <div className='collection-item-stats'>Rating: {collectionItem.rating}</div>
                            <div className='collection-item-stats'>Kit ID: {collectionItem.kitId}</div>
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>
    );
}