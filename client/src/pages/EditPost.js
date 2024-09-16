import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../Editor";

export default function EditPost() {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState(null);
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:4000/post/${id}`)
            .then(response => response.json())
            .then(postInfo => {
                setTitle(postInfo.title);
                setContent(postInfo.content);
                setSummary(postInfo.summary);
            })
            .catch(err => setError('Failed to load post'));
    }, [id]);

    async function updatePost(ev) {
        ev.preventDefault();
        const data = new FormData();
        data.append('title', title);
        data.append('summary', summary);
        data.append('content', content);
        data.append('id', id);
        if (files?.[0]) {
            data.append('file', files[0]);
        }

        try {
            const response = await fetch(`http://localhost:4000/post/${id}`, {
                method: 'PATCH',
                body: data,
                credentials: 'include',
            });

            if (response.ok) {
                setRedirect(true);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to update post');
            }
        } catch (err) {
            setError('Network error');
        }
    }

    if (redirect) {
        return <Navigate to={`/post/${id}`} />;
    }

    return (
        <form onSubmit={updatePost}>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={ev => setTitle(ev.target.value)}
            />
            <input
                type="text"
                placeholder="Summary"
                value={summary}
                onChange={ev => setSummary(ev.target.value)}
            />
            <input
                type="file"
                onChange={ev => setFiles(ev.target.files)}
            />
            <Editor onChange={setContent} value={content} />
            <button type="submit" style={{ marginTop: '5px' }}>
                Update post
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
}
