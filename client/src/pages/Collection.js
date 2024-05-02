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
        return <div className='profile-page-wrapper'>User not found</div>;
      }
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (error) {
        return <div className='profile-page-wrapper'>Error: {error.message}</div>;
    }

    return (
        <div className='page-wrapper'>
            <div className='head-wrapper'>
                <h1>{username}'s Collection</h1>
            </div>
            {targetUser && targetUser.collection && (
            <div className='content-wrapper'>
                {targetUser.collection.map((collectionItem, index) => (
                    <div className='collection-item' key={index}>
                        <KitDetails kitId={collectionItem.kitId} />
                        <div className='collection-item-stats'>
                            <div>Kit ID:<br />{collectionItem.kitId}</div>
                            <div>{getStatusLabel(collectionItem.status)}</div>
                            <div>Rating: {collectionItem.rating}</div>
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>
    );
}