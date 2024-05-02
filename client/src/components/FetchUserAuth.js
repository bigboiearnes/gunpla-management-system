// Fetch current user's username using their token
export const fetchUserAuth = async (token) => {
    try {
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch username');
      }
  
      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error fetching username:', error);
      return null;
    }
  };