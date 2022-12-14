const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

router.post('/api/user/signup', (req, res) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });

    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: 'User created',
          result,
        });
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  });
});

router.post('/api/user/login', (req, res) => {
  User.findOne({ email: req.body.email }).then((user) => {
    if (!user) {
      return res.status(401).json({ message: 'Auth failed' });
    }

    bcrypt
      .compare(req.body.password, user.password)
      .then((result) => {
        if (!result) {
          return res.status(401).json({ message: 'Auth failed' });
        }

        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id,
          },
          'secret_this_should_be_longer',
          {
            expiresIn: '1h',
          }
        );

        return res
          .status(200)
          .json({ token, expiresIn: 3600, userId: user._id });
      })
      .catch((err) => {
        return res.status(401).json({ message: 'Auth failed' });
      });
  });
});

module.exports = router;
