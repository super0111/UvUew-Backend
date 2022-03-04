const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Post = require('../../models/post');
const Comments = require("../../models/comments");
const Tip = require('../../models/tip');
const Likes = require('../../models/likes');


const TransactionHistory = require('../../models/transactionHistory');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/contents')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
})
const upload = multer({storage});

//get posted contents info
router.get(
  '/', (req, res) => {
    Post.find({})
    .populate(['comments', 'tips'])
    .then(posts=>res.json(posts))
    .catch(err=>{console.log(err)
      res.status(404).json({err: 'no found'});
    });
  }
);


//get posted contents by userID
router.get(
  '/:id', (req, res) => {
    Post.find({ userID : req.params.id })
    .populate(['comments', 'tips'])
    .then(posts=>res.json(posts))
    .catch(err=>{console.log(err)
      res.status(404).json({err: 'no found'});
    });
  }
);


//post contents by one creator
router.post(
  '/',
  upload.any('file'),
  check('description', 'description is required').notEmpty(),
  async (req, res) => {
    if(req.contentImg && req.contentImg.length > 0) {
      req
        .contentImg
        .forEach(element => {
          const size = element.size;
          const tempPath = element.path;
          const filename = element.originalname;
          const filename_new = element.filename;
          const type = element.mimetype;
          const ext = path
            .extname(filename)
            .toLowerCase();
          const targetPath = "./uploads/images/" + filename_new + ext;
          contentImg.push(filename_new + ext);
          fs.rename(tempPath, targetPath, function (err) {
            if (err) {
              console.log(err.message)
              throw err;
            }
          });
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let contentImg = null;

    req.files.forEach(({fieldname, filename}) => {
        contentImg = filename;
    })

    const { userID, description, price, contentType } = req.body;

    const date = new Date();
    const newpost = new Post({
      userID,
      contentImg,
      description,
      price,
      contentType,
      date
    });
    newpost.save()
    .then(posts => res.json(posts))
    .catch(err => {
        res.status(400).json({ContentAdd: err.message})
    });
  }
);


//post tip by viewer in feed page
router.post(
  '/:id/giveTip',
  async (req, res) => {
    const postId = req.params.id;
    const { tipPrice, tipMessage, userId } = req.body;
    // const userId = req.userId;
    const date = new Date();
    const tip = await Tip.create({tipPrice, tipMessage, date, userId});
    // const post = await Post.find


    // await TransactionHistory.findOneAndUpdate({ creatorId: userId,  })

    Post.findOneAndUpdate({
      _id: postId
    }, {
      $addToSet: {
        tips: [{ _id: tip._id }]
      }
    })
    .then(aaa => res.json(aaa))
    .catch(err => {
      res.status(400).json({Tip : err.message})
    });

  }
);


//post comments about project by viewer in feed page
router.post(
  '/:id/comments',
  async (req, res) => {
    const postId = req.params.id;
    const { comments, userId } = req.body;

    const date = new Date();
    const comment = await Comments.create({ comments, date, userId});
    Post.findOneAndUpdate({
      _id: postId
    }, {
      $addToSet: {
        comments: [{ _id: comment._id,}]
      }
    })
    .then(aaa => res.json(aaa))
    .catch(err => {
      res.status(400).json({Comment : err.message})
    });
  }
);


//post like by viewer in feed page
router.post(
  '/:id/likes',
  async (req, res) => {
    const postID = req.params.id;
    const { userID } = req.body;

    const date = new Date();

    const oldPost = await Likes.findOne({ userID, postID });

    if (oldPost) {
      console.log('exits', oldPost)
      return res.status(400).json({Like : "already have done"})
    }
    const like = await Likes.create({ userID, postID, date});
    Post.findOneAndUpdate({
      _id: postID,
    }, {
      $addToSet: {
        likes: [{ _id: like._id,}]
      }
    })
    .then(like => {
      res.json(like)
    })
    .catch(err => {
      res.status(400).json({Like : "like error"})
    });
  }
)

module.exports = router;