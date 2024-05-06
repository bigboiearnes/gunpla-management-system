import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import './Search.css'

let didInit = false;

export default function Search() {
    const [searchResults, setSearchResults] = useState([]); // State to hold search results
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 18; // Number of results for search bar to return

    useEffect (() => {
        if (!didInit) {
            didInit = true;
            const urlParams = new URLSearchParams(window.location.search);
            const savedPage = parseInt(urlParams.get('page')) || 1;
            const savedQuery = urlParams.get('query') || '';

            setPage(savedPage);
            setQuery(savedQuery);
        }
    }, []);

    const handleSearchResults = (results) => {
        setSearchResults(results); // Update search results state
    };

    const handleBack = (page) => {
        if (page === 1) {
            return
        }

        const urlParams = new URLSearchParams(window.location.search);
        const prevPage = (parseInt(urlParams.get('page'))-1) || 1;
        setPage(prevPage);

        const params = new URLSearchParams({ query, page: prevPage }); // Update URL with page 1
        window.history.pushState({}, '', `${window.location.pathname}?${params}`);

        window.location.reload();
    };

    const handleForward = (page) => {
        const urlParams = new URLSearchParams(window.location.search);
        const prevPage = (parseInt(urlParams.get('page'))+1) || 1;
        setPage(prevPage);

        const params = new URLSearchParams({ query, page: prevPage }); // Update URL with page 1
        window.history.pushState({}, '', `${window.location.pathname}?${params}`);

        window.location.reload();
    };

    return (
        <div className="search-page-wrapper">
            <div className="search-head-wrapper">
                <div className="search-bar-wrapper">
                    <div>
                    <button onClick={handleBack}>Back</button>
                    </div>
                    <SearchBar onSearchResults={handleSearchResults} pageSize={pageSize} page={page} />
                    <div>
                    <button onClick={handleForward}>Forward</button> 
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
