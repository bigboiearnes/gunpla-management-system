import React, { useEffect, useState } from 'react';
import { fetchPopularTags } from '../components/FetchPopularTags';
import '../pages/Home.css'

function PopularTags() {
    const [popularTags, setPopularTags] = useState([]);
    
    useEffect(() => {
        // Fetch popular tags and associated kits when the component mounts
        const getPopularTags = async () => {
            try {
                const tags = ['fun', 'beginner', 'cool']; // Popular tags
                const popularTagsData = await Promise.all(tags.map(async (tag) => {
                    const kits = await fetchPopularTags(tag);
                    return { tag, kits }; // Return an object with tag and kits properties
                }));
                setPopularTags(popularTagsData);
            } catch (error) {
                console.error('Error fetching popular tags:', error);
            }
        };
        
        getPopularTags();
    }, []);
    
    return (
        <div >
            {popularTags.length > 0 ? (
                popularTags.map((tagData, index) => (
                    <div className='home-card-row-wrapper' key={index}>
                        <h2 className='home-section-header'>Kits that users tagged as '{tagData.tag}'</h2>
                        {tagData.kits.length > 0 ? (
                            <div className='home-card-row'>
                                {tagData.kits.map((kit, kitIndex) => (
                                    <div className='home-card'>
                                    <img className='home-card-image' key={kitIndex} src={kit.boxArt} alt={kit.kitName} />
                                    <br />
                                    <a href={`/database/${kit.kitId}`} key={kitIndex}>{kit.kitName}</a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No kits found for this tag.</p>
                        )}
                    </div>
                ))
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default PopularTags;