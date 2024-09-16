// import React, { useState, useEffect } from 'react';
// import Post from '../Post';

// export default function IndexPage() {
//     const [posts, setPosts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         fetch('http://localhost:4000/posts')
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 setPosts(data);
//                 setLoading(false);
//             })
//             .catch(error => {
//                 setError(error);
//                 setLoading(false);
//             });
//     }, []);

//     if (loading) {
//         return <div>Loading...</div>;
//     }

//     if (error) {
//         return <div>Error: {error.message}</div>;
//     }

//     return (
//         <div>
//             {posts.map(post => (
//                 <Post
//                     key={post._id}
//                     _id={post._id}
//                     title={post.title}
//                     summary={post.summary}
//                     cover={post.cover}
//                     content={post.content}
//                     createdAt={post.createdAt}
//                     author={post.author}
//                 />
//             ))}
//         </div>
//     );
// }


import React, { useState, useEffect } from 'react';
import Post from '../Post';

function ToggleSwitch({ isOn, handleToggle }) {
    return (
        <span className="toggle-switch">
            <input
                checked={isOn}
                onChange={handleToggle}
                className="toggle-switch-checkbox"
                id={`toggle-switch`}
                type="checkbox"
            />
            <label className="toggle-switch-label" htmlFor={`toggle-switch`}>
                <span className="toggle-switch-inner" />
                <span className="toggle-switch-switch" />
            </label>
        </span>
    );
}

export default function IndexPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        fetch('http://localhost:4000/posts')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setPosts(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    const handleToggle = () => {
        setDarkMode(prevMode => !prevMode);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div>
            <ToggleSwitch isOn={darkMode} handleToggle={handleToggle} />
            {posts.map(post => (
                <Post
                    key={post._id}
                    _id={post._id}
                    title={post.title}
                    summary={post.summary}
                    cover={post.cover}
                    content={post.content}
                    createdAt={post.createdAt}
                    author={post.author}
                />
            ))}
        </div>
    );
}

