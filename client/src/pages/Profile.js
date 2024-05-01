import React from 'react';
import { useParams } from 'react-router-dom';
import useFetchUser from '../components/FetchUserData';


export default function Profile(){
  const { username } = useParams();
  const { user, loading, error } = useFetchUser(username);


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
    <div className='profile-page-wrapper'>
      <div className='profile-page-head'>
       <h1>{user.username}</h1>
      </div>
      <div className='profile-page-content'>

      </div>
      
    </div>
  );
};
