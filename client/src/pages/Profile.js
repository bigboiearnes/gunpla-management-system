import React from 'react';
import { useParams } from 'react-router-dom';
import useFetchUser from '../components/FetchUserData';
import { useAuth } from '../components/AuthContext';

export default function Database(){
  const { username } = useParams();
  const { user, loading, error } = useFetchUser(username);
  const { token } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <h1>{user.username}</h1>
    </div>
  );
};
