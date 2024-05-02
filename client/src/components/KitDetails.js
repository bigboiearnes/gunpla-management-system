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
      <div className="kit-details-wrapper">
        <div className="kit-details-text-wrapper">
        <p className="collection-kit-name">{kit.kitName}</p>
        <p className='kit-release-date'>Release Date: {kit.releaseMonth}/{kit.releaseYear}</p>
        </div>
        <img className='kit-box-art' src={kit.boxArt} alt={kit.kitName}></img>
      </div>
    );
}