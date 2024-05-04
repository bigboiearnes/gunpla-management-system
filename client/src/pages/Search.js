import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import './Search.css'

export default function Search() {
    const [searchResults, setSearchResults] = useState([]); // State to hold search results
    const pageSize = 15; // Number of results for search bar to return

    const handleSearchResults = (results) => {
        setSearchResults(results); // Update search results state
    };

    return (
        <div className="search-page-wrapper">
            <div className="search-head-wrapper">
                <div className="search-bar-wrapper">
                    <div>
                    <button>Back</button>
                    </div>
                    <SearchBar onSearchResults={handleSearchResults} pageSize={pageSize}/>
                    <div>
                    <button>Forward</button> 
                    </div>
                </div>
            </div>
            <div className="search-body-wrapper">
                    {searchResults.map((result, index) => (
                        <div className='search-result-wrapper' key={index}>
                            <div>
                                <p className='search-kit-id'>Kit ID: {result.kitId}</p>
                                <a href={`/database/${result.kitId}`} className="collection-kit-name">{result.kitName}</a>
                                <p className='search-kit-grade'>Grade: {result.kitGrade}</p>
                                {/* Render other properties as needed */}
                            </div>
                            <img className='search-kit-box-art' src={result.boxArt} alt={result.kitName}></img>
                        </div>
                    ))}
            </div>
        </div>
    );
}
