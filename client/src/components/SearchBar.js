import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../pages/Search.css'

let didInit = false;

function SearchBar({ onSearchResults, pageSize }) { 
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const observer = useRef(null);

    useEffect (() => {
        if (!didInit) {
            didInit = true;
            const urlParams = new URLSearchParams(window.location.search);
            const savedQuery = urlParams.get('query') || '';
            const savedPage = parseInt(urlParams.get('page')) || 1;

            setQuery(savedQuery);
            setPage(savedPage);

            if (savedQuery) {
                searchKits(savedQuery, savedPage);
            }
        }
    }, []);

    const searchKits = async (query, page) => {
        try {
            setLoading(true);

            const response = await axios.get('/api/kit/search/', {
                params: {
                    query: query,
                    page: page,
                    pageSize: pageSize
                }
            });
            setResults(response.data);
            setPage(prevPage => prevPage + 1);
            setLoading(false);
            onSearchResults(response.data); // Pass search results to parent component
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

    return (
        <div>
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
        </div>
    );
}

export default SearchBar;