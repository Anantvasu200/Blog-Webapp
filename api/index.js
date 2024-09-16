const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const PostModel = require('./models/Post'); // Correctly import PostModel
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

const app = express();
const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

// MongoDB Connection
mongoose.connect('mongodb+srv://anantawasthi773:38fF2xylar1I38GI@cluster0.uro0m0t.mongodb.net/myDatabase?retryWrites=true&w=majority')
    .then(() => console.log("MongoDB connected"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit the process with an error
    });

// Routes
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        res.json(userDoc);
    } catch (e) {
        console.log(e);
        res.status(400).json(e);
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.findOne({ username });
        if (!userDoc || !bcrypt.compareSync(password, userDoc.password)) {
            return res.status(400).json('Wrong credentials');
        }

        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).json({
                id: userDoc._id,
                username,
            });
        });
    } catch (e) {
        res.status(500).json('Error during login');
    }
});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
    }

    jwt.verify(token, secret, (err, info) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        res.json(info);
    });
});

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const { originalname, path } = req.file;
    const ext = originalname.split('.').pop();
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    const { token } = req.cookies;
    try {
        jwt.verify(token, secret, async (err, info) => {
            if (err) throw err;
            const { title, summary, content } = req.body;
            const postDoc = await PostModel.create({
                title,
                summary,
                content,
                cover: newPath,
                author: info.id,
            });
            res.json(postDoc);
        });
    } catch (e) {
        res.status(500).json('Error creating post');
    }
});

// PATCH / Update Routes
app.patch('/post/:id', uploadMiddleware.single('file'), async (req, res) => {
    const { id } = req.params;
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
    }

    jwt.verify(token, secret, async (err, info) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        try {
            const postDoc = await PostModel.findById(id);
            if (!postDoc) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
            if (!isAuthor) {
                return res.status(403).json('You are not the author');
            }

            let updatedFields = { title: req.body.title, summary: req.body.summary, content: req.body.content };

            if (req.file) {
                const { originalname, path } = req.file;
                const ext = originalname.split('.').pop();
                const newPath = path + '.' + ext;
                fs.renameSync(path, newPath);
                updatedFields.cover = newPath;
            }

            await PostModel.findByIdAndUpdate(id, updatedFields, { new: true });
            res.json({ message: 'Post updated successfully' });

        } catch (updateError) {
            res.status(500).json({ error: 'Failed to update post' });
        }
    });
});

// Get Routes
app.get('/posts', async (req, res) => {
    res.json(
        await PostModel.find()
            .populate('author', ['username'])
            .sort({ createdAt: -1 })
            .limit(20)
    );
});

app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await PostModel.findById(id).populate('author', ['username']);
    res.json(postDoc);
});

// Search Endpoint
app.get('/search', async (req, res) => {
    try {
        const query = req.query.q || '';

        if (!query.trim()) {
            return res.status(400).json({ message: 'Search query cannot be empty' });
        }

        const results = await PostModel.find({
            $text: { $search: query }
        }).exec();
        console.log('Search Results:', results);


        res.json(results);
    } catch (error) {
        console.error('Error handling search request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
