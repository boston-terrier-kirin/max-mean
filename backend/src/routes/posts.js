const express = require('express');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const Post = require('../models/post');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(error, 'images');
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLocaleLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  },
});

router.get('/api/posts', (req, res) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;

  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }

  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then((count) => {
      res.status(200).json({
        message: 'Posts fetched successfully',
        posts: fetchedPosts,
        maxPosts: count,
      });
    });
});

router.get('/api/posts/:id', (req, res) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  });
});

router.post(
  '/api/posts',
  checkAuth,
  multer({ storage }).single('image'),
  (req, res) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
      creator: req.userData.userId,
      title: req.body.title,
      content: req.body.content,
      imagePath: url + '/images/' + req.file.filename,
    });

    post.save().then((result) => {
      res.status(201).json({
        post: {
          id: result._id,
          creator: req.userData.userId,
          title: result.title,
          content: result.content,
          imagePath: result.imagePath,
        },
        message: 'Post added successfully',
      });
    });
  }
);

router.put(
  '/api/posts/:id',
  checkAuth,
  multer({ storage }).single('image'),
  (req, res) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + '://' + req.get('host');
      imagePath = url + '/images/' + req.file.filename;
    }

    const post = new Post({
      _id: req.params.id,
      creator: req.userData.userId,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
    });

    Post.updateOne(
      {
        _id: req.params.id,
        creator: req.userData.userId,
      },
      post
    ).then((result) => {
      if (result.modifiedCount > 0) {
        res.status(200).json({ message: 'Updated successfully' });
      } else {
        res.status(401).json({ message: 'Not authorized' });
      }
    });
  }
);

router.delete('/api/posts/:id', checkAuth, (req, res) => {
  Post.deleteOne({
    _id: req.params.id,
    creator: req.userData.userId,
  }).then((result) => {
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Post deleted' });
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  });
});

module.exports = router;
