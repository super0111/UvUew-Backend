const express = require('express');
const router = express.Router();
const Post = require('../../models/post');

//get posts by serveral creator in explore page
router.get(
    '/getByUser', (req, res) => {
      Post.find({})
      .populate(['comments', 'tips'])
      .then(posts=>res.json(posts))
      .catch(err=>{console.log(err)
      res.status(404).json({err: 'no found'});
    });
    }
);


//get details about a post by creator in explore page
router.get(
    '/:id/moreDetail/', 
    (req, res) => {
        Post.findById(req.params.id)
        .populate(['comments', 'tips'])
        .then(posts=>res.json(posts))
        .catch(err=>{console.log(err)
        res.status(404).json({err: "no found"});
        });
    }
);

module.exports = router;