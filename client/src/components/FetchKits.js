import { useState, useEffect } from 'react';

const useFetchKits = (kitId) => {
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKitData = async () => {
      try {
        const response = await fetch(`/api/kits/${kitId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setKit(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchKitData();
  }, [kitId]);

  return { kit, loading, error };
};

export default useFetchKits;
