// controllers/hoots.js

const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Hoot = require('../models/hoot.js');
const router = express.Router();

// ========== Public Routes ===========
router.get('/', async (req, res) => {
    try {
      const hoots = await Hoot.find({})
        .populate('author')
        .sort({ createdAt: 'desc' });
      res.status(200).json(hoots);
    } catch (error) {
      res.status(500).json(error);
    }
  });
// ========= Protected Routes =========

// this is like app.use() and we're
// using our verifyToken middleware
// to protect any routes that follow
router.use(verifyToken);

// POST hoot etc all wll go here, after the verifyToken

// to hit this route, the full adress is
// POST /hoots
router.post('/', async (req, res) => {
    try {
      req.body.author = req.user._id;
      const hoot = await Hoot.create(req.body);
      hoot._doc.author = req.user;
      res.status(201).json(hoot);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
});

// full url would bel ike POST /hoots/slfkdjs123/comments
router.post('/:hootId/comments', async (req, res) => {
    try {
      req.body.author = req.user._id;
      const hoot = await Hoot.findById(req.params.hootId);
      hoot.comments.push(req.body);
      await hoot.save();
  
      // Find the newly created comment:
      const newComment = hoot.comments[hoot.comments.length - 1];
  
      newComment._doc.author = req.user;
  
      // Respond with the newComment:
      res.status(201).json(newComment);
    } catch (error) {
      res.status(500).json(error);
    }
});

// the full URL to hit this route would be
// GET /hoots/sfjdlkj2lkjldkjl
router.get('/:hootId', async (req, res) => {
    try {
      const hoot = await Hoot.findById(req.params.hootId).populate('author');
      res.status(200).json(hoot);
    } catch (error) {
      res.status(500).json(error);
    }
});

router.put('/:hootId', async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId)

    if (!hoot.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    const updatedHoot = await Hoot.findByIdAndUpdate(
      req.params.hootId,
      req.body,
      { new: true }
    )

    updatedHoot._doc.author = req.user;

    res.status(200).json(updatedHoot);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put('/:hootId/comments/:commentId', async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);
    const comment = hoot.comments.id(req.params.commentId);
    comment.text = req.body.text;
    await hoot.save();
    res.status(200).json({ message: 'Ok' });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:hootId', async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);

    if (!hoot.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    };

    const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
    res.status(200).json(deletedHoot);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete('/:hootId/comments/:commentId', async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);
    hoot.comments.remove({ _id: req.params.commentId });
    await hoot.save();
    res.status(200).json({ message: 'Ok' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;