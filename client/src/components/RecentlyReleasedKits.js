import React, { useEffect, useState } from 'react';

export default function RecentlyReleasedKits() {
    const [recentlyReleasedKits, setRecentlyReleasedKits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecentlyReleasedKits = async () => {
            try {
                const response = await fetch('/api/kits/get/recently-released');
                if (!response.ok) {
                    throw new Error('Failed to fetch recently released kits');
                }
                const data = await response.json();
                setRecentlyReleasedKits(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching recently released kits:', error);
                setIsLoading(false);
            }
        };

        fetchRecentlyReleasedKits();
    }, []);

    return (
        <div className='home-card-row-wrapper'>
            <h2 className='home-section-header'>Recently Released Kits</h2>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div className='home-card-row'>
                    {recentlyReleasedKits.map((kit, index) => (
                        <div className='home-card'>
                        <img className='home-card-image' key={index} src={kit.boxArt} alt={kit.kitName} />
                        <br />
                        <a href={`/database/${kit.kitId}`} key={index}>{kit.kitName}</a>
                        <p key={index}>{kit.releaseYear}/{kit.releaseMonth}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
