import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FetchFriends = ({ targetUser, username, token }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const fetchFriendsData = async () => {
      try {
        const response = await axios.get(`/api/friends/fetch/${targetUser}`);
        const friendshipStatus = await axios.post('/api/friends/users', {
            sender: username,
            receiver: targetUser
        });
        
        setFriends(response.data);
        setLoading(false);
        setIsFriend(response.data.includes(username));
        setIsPending(friendshipStatus.data.message.includes('exists'));
        
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchFriendsData();
  }, [targetUser, username]);

  const handleSendFriendRequest = async () => {
    try {
        console.log(username, targetUser);
        await axios.post('/api/friends/request', {
            sender: username,
            receiver: targetUser
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        alert('Friend request sent successfully');
        window.location.reload();
      } catch (error) {
        console.error('Error sending friend request:', error);
        alert('Failed to send friend request');
      }
    };

    const handleDeleteFriend = async (friend) => {
        try {
            await axios.post('/api/friends/delete', {
              sender: username,
              receiver: friend,
            }, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
            });
            window.location.reload();
          } catch (error) {
            console.error('Error deleting friend:', error);
          }

    }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (friends.length === 0) {
    return (
        <div>
            {!isFriend && !loading && !error && !isPending && username && username !== targetUser && (
            <button onClick={handleSendFriendRequest}>Send Friend Request</button>
            )}
            <h2>Friends</h2>
            <p>
                No friends found!
            </p>
        </div>
    )
  }

  return (
    <div>
        {!isFriend && !loading && !error && !isPending && username && username !== targetUser && (
        <button onClick={handleSendFriendRequest}>Send Friend Request</button>
        )}
        <h2>Friends</h2>
        {loading && <div>Loading...</div>}
        {error && <div>Error: {error.message}</div>}
            {friends.map((friend, index) => (
            <p className='friend-item' key={index}>
                <a href={`/profile/${friend}`}>{friend}</a>
                {targetUser === username &&
                    <button onClick={() =>handleDeleteFriend(friend)}>Delete</button>
                }       
            </p>
            ))}
    </div>
  );
};

export default FetchFriends;
