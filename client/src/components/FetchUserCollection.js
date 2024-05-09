// Fetches user collection using their username
import { useState, useEffect } from 'react';

const useFetchUserCollection = (username) => {
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`https://gunplamanagementsystemapi.azurewebsites.net/api/user/collection/fetch/${username}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setTargetUser(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  return { targetUser, loading, error };
};



export default useFetchUserCollection;