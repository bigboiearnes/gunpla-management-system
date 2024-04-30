import React from 'react';
import { useParams } from 'react-router-dom';
import useFetchKits from '../components/FetchKits';

export default function Database(){
  const { kitId } = useParams();
  const { kit, loading, error } = useFetchKits(kitId);

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
    </div>
  );
};
