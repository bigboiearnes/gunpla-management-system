import useFetchKit from "./FetchKits";
import '../pages/Collection.css'

export default function KitDetails({ kitId }) {
    const { kit, loading, error } = useFetchKit(kitId);
  
    if (loading) {
      return <p>Loading kit details...</p>;
    }
  
    if (error) {
      return (
        <div className="collection-kit-details-wrapper">
        <p className='collection-kit-box-art'></p>
        <div className="collection-kit-details-text-wrapper">
        <p className="headcollection-kit-name">Kit Name</p>
        <p className='collection-kit-release-date'></p>
        </div>
        <p className="collection-kitid">Kit ID</p>
        <p className="collection-kit-grade">Grade</p>
      </div>
      );
    }
  
    if (!kit) {
      return <p>Kit not found</p>;
    }
  
    return (
      <div className="collection-kit-details-wrapper">
        <img className='collection-kit-box-art' src={kit.boxArt} alt={kit.kitName}></img>
        <div className="collection-kit-details-text-wrapper">
        <a href={`/database/${kitId}`} className="collection-kit-name">{kit.kitName}</a>
        <p className='collection-kit-release-date'>Release Date: {kit.releaseMonth}/{kit.releaseYear}</p>
        </div>
        <p className="collection-kitid">{kit.kitId}</p>
        <p className="collection-kit-grade">{kit.kitGrade}</p>
      </div>
    );
}