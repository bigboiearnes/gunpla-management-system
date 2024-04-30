import React from 'react';
import { useParams } from 'react-router-dom';
import useFetchKits from '../components/FetchKits';

const Database = () => {
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
      <h1>{kit.kitName}</h1>
      <p>{kit.biography}</p>
    </div>
  );
};

export default Database;
