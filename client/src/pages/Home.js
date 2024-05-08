import React, { useEffect, useState } from 'react';
import PopularTags from '../components/PopularTags';
import RecentUploads from '../components/RecentUploads';
import RecentlyReleasedKits from '../components/RecentlyReleasedKits';

export default function Home(){


    return (
        <>
            <div className='home-page-wrapper'>
                <div className='home-head-wrapper'>
                    <img className='home-title-image' src='https://i.ibb.co/vkz9Kh0/Gunpla.png' alt='Gunpla Management System' />
                    <p className='home-description'>Thank you for visiting! 
                    GMS is a social cataloguing site based all around your Gunpla
                     collection! <br /> We have a database of all non-exclusive High Grades,
                      Master Grades, Perfect Grades, Real Grades, and Advanced Grades
                        using entries scraped from 
                       <a href='http://dalong.net/'> Dalong </a>
                        and <a href='https://gundam.fandom.com/f'>The Gundam Wiki </a>
                         and then cleaned to fit this website. <br /> If images aren't loading 
                         you may need to disable your AdBlock, we do not have
                         any ads on this website so you are safe to do this!<br />
                         Logo designed using <a href='https://www.canva.com/'>Canva</a>.</p>
                </div>
                <div className='home-content-wrapper'>
                    <div className='home-friend-upload-wrappers'>
                        <RecentUploads />
                    </div>
                    <div className='home-recently-released'>
                        <RecentlyReleasedKits />
                    </div>
                    <div>
                        <PopularTags />
                    </div>
                    
                </div>
            </div>
        </>
    );
}
