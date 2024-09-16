import { Link } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "./UserContext";

export default function Header() {
    const { setUserInfo, userInfo } = useContext(UserContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetch('http://localhost:4000/profile', {
            credentials: 'include',
        }).then(response => {
            response.json().then(userInfo => {
                setUserInfo(userInfo);
            });
        });
    }, [setUserInfo]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function logout() {
        fetch('http://localhost:4000/logout', {
            credentials: 'include',
            method: 'POST',
        }).then(() => setUserInfo(null));
    }

    const username = userInfo?.username;

    const handleSearch = async () => {
        if (searchQuery.trim()) {
            try {
                const response = await fetch(`http://localhost:4000/search?q=${encodeURIComponent(searchQuery)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Search Results:', data);  // Debugging line
                setSearchResults(data);
            } catch (error) {
                console.error('Error searching:', error);
            }
        } else {
            setSearchResults([]);
        }
    };

    return (
        <header>
            <Link to="/" className="logo">TechTalk</Link>
            <nav>
                {username && (
                    <>
                        <Link to="/create">Create new post</Link>
                        <a onClick={logout}>Logout ({username})</a>
                    </>
                )}
                {!username && (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
                <div className="search-bar" ref={dropdownRef}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            handleSearch();
                        }}
                    />
                    {searchQuery && searchResults.length > 0 && (
                        <div className="search-suggestions">
                            <ul>
                                {searchResults.map((result) => (
                                    <li key={result._id}>
                                        <Link to={`/post/${result._id}`}>
                                            <h3>{result.title}</h3>
                                            <p>{result.summary}</p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}
