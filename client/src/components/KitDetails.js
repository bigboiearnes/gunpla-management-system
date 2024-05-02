import useFetchKit from "./FetchKits";
import '../pages/Collection.css'

export default function KitDetails({ kitId }) {
    const { kit, loading, error } = useFetchKit(kitId);
  
    if (loading) {
      return <p>Loading kit details...</p>;
    }
  
    if (error) {
      return <p>Error fetching kit details: {error.message}</p>;
    }
  
    if (!kit) {
      return <p>Kit not found</p>;
    }
  
    return (
      <div className="collection-kit-details-wrapper">
        <div className="collection-kit-details-text-wrapper">
        <a href={`/database/${kitId}`} className="collection-kit-name">{kit.kitName}</a>
        <p className='collection-kit-release-date'>Release Date: {kit.releaseMonth}/{kit.releaseYear}</p>
        </div>
        <img className='collection-kit-box-art' src={kit.boxArt} alt={kit.kitName}></img>
      </div>
    );
}