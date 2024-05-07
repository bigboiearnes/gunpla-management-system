import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Search.css'

let didInit = false;

export default function Search() {
    const [searchResults, setSearchResults] = useState([]); // State to hold search results
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 18; // Number of results for search bar to return
    const [loading, setLoading] = useState(false);

    useEffect (() => {
        if (!didInit) {
            didInit = true;
            const urlParams = new URLSearchParams(window.location.search);
            const savedPage = parseInt(urlParams.get('page')) || 1;
            const savedQuery = urlParams.get('query') || '';

            setPage(savedPage);
            setQuery(savedQuery);

            if (savedQuery) {
                searchKits(savedQuery, savedPage);
            }
        }
    }, []);

    const searchKits = async (query, page) => {
        try {
            setLoading(true);

            const response = await axios.get('/api/kits/search/', {
                params: {
                    query: query,
                    page: page,
                    pageSize: pageSize
                }
            });
            setPage(prevPage => prevPage + 1);
            setLoading(false);
            setSearchResults(response.data); // Pass search results to parent component
        } catch (error) {
            console.error('Error searching for kits', error);
            setLoading(false);
        }
    };

    const handleInputChange = (event) => {
        setQuery(event.target.value)
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setPage(1); // Reset page to 1 when a new query is submitted
        searchKits(query, 1); // Always start searching from page 1
        const params = new URLSearchParams({ query, page: 1 }); // Update URL with page 1
        window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    };

    const handleBack = () => {
        if (page === 1) {
            return
        }

        const urlParams = new URLSearchParams(window.location.search);
        const prevPage = (parseInt(urlParams.get('page'))-1) || 1;
        const savedQuery = urlParams.get('query') || '';

        setPage(prevPage);
        setQuery(savedQuery);

        const params = new URLSearchParams({ query, page: prevPage }); // Update URL with previous page
        const newUrl = `${window.location.pathname}?${params}`;
        window.history.pushState({}, '', newUrl);

        searchKits(savedQuery, prevPage); // Fetch search results for previous page
    };

    const handleForward = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const nextPage = (parseInt(urlParams.get('page')) + 1) || 1;
        const savedQuery = urlParams.get('query') || '';

        setPage(nextPage);
        setQuery(savedQuery);

        const params = new URLSearchParams({ query, page: nextPage }); // Update URL with next page
        const newUrl = `${window.location.pathname}?${params}`;
        window.history.pushState({}, '', newUrl);

        searchKits(savedQuery, nextPage); // Fetch search results for next page
    };

    return (
        <div className="search-page-wrapper">
            <div className="search-head-wrapper">
                <div className="search-bar-wrapper">
                    <div>
                        <button onClick={handleBack}>Back</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <input
                            className='search-bar-input'
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            placeholder="Search..."
                        />
                        <button type="submit">Search</button>
                        {loading && <div>Loading...</div>}
                    </form>
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
                        </div>
                        <img className='search-kit-box-art' src={result.boxArt} alt={result.kitName}></img>
                    </div>
                ))}
            </div>
        </div>
    );
}

