import React from 'react';
import { useParams } from 'react-router-dom';
import useFetchKit from '../components/FetchKits';
import { useAuth } from '../components/AuthContext';

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
    <div>
      <h1>{kit.kitName} - {kit.kitGrade}</h1>
      <h2>Gundam Designation: {kit.gundamModel}</h2>
      <p>{kit.biography}</p>
      <img src={kit.boxArt} alt={kit.kitName}></img>
      <button onClick={handleAddToCollection}>Add to collection</button>
    </div>
  );
};
