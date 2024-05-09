import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import '../pages/Home.css'

import axios from 'axios';

export default function RecentUploads() {
    const [recentUploads, setRecentUploads] = useState([]);
    const { token } = useAuth();


    useEffect(() => {
        const fetchRecentUploads = async () => {
            try {
                const response = await axios.get('https://gunplamanagementsystemapi.azurewebsites.net/api/friends/recent-uploads', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setRecentUploads(response.data);
            } catch (error) {
                console.error('Error fetching recent uploads:', error);
            }
        };

        fetchRecentUploads();
    }, []);

    return (
        <div>
            {token &&
            <div className='home-card-row-wrapper'>
                <h2 className='home-section-header'>Recent Uploads from Friends</h2>
                <div className='home-card-row'>
                    {recentUploads.map((upload, index) => (
                        <div>
                            {upload.image &&
                                <div className='home-card'>
                                    <a href={`/database/${upload.kitId}`}>
                                    <img className='home-card-image' key={index} src={upload.image} alt={upload.kitId} />
                                    </a>
                                    <br />
                                    <a href={`/profile/${upload.username}`}>{upload.username}</a>
                                </div>
                        
                            }
                        </div>
                        
                    ))}
                </div>
            </div>
            }
        </div>
    );
}