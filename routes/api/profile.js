const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Post = require('../../models/post');
const UserFollowing = require('../../models/userFollowing');
const CoinAmount = require('../../models/coinAmount');
const TransactionHistory = require('../../models/transactionHistory');
const Contact = require('../../models/contact');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe');
const stripe = Stripe('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');
// const stripe = require("stripe")("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");


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/files')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
  })
  const upload = multer({storage});

//stripe connect
router.post('/stripeIntent', async function(req, res) {
    const {amount, currency, description, token, name, email} = req.body.data
    const customer = stripe.customers.create({
        name: name,
        email: email,
        source: token.id,
    })
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency, 
        description: description,
        customer: customer.id,
    });

    res.json({success: 'success', url: req.url, body: {clientSecret: paymentIntent.client_secret}})
});


//get current user info in profile section
router.get(
    '/getUser/:id/', (req, res) => {
        User.findById(req.params.id)
        .then(users=>res.json(users))
        .catch(err=>{console.log(err)
            res.status(404).json({err: 'no found'});
        });
    }
)


//get comments about creator in profile section
router.get(
    '/comments/:id/', 
    async (req, res) => {
        const postsArray = await Post.find({ userID : req.params.id }).populate(['comments', 'tips']);
        console.log(postsArray)
        let arr = [];
        postsArray.forEach((post) => {
            arr = [...arr, ...post.comments]
        })
        res.status(200).json({message: 'success', data: arr});
    } 
);


//edit user info i profile section(edit profile button)
router.put(
    '/:id/edit',
    upload.any('file'),
    (req, res) => {
        if(req.IDFront && req.IDFront.length > 0) {
            req
              .IDFront
              .forEach(element => {
                const tempPath = element.path;
                const filename = element.originalname;
                const filename_new = element.filename;
                const ext = path
                  .extname(filename)
                  .toLowerCase();
                const targetPath = "./uploads/images/" + filename_new + ext;
                IDFront.push(filename_new + ext);
                fs.rename(tempPath, targetPath, function (err) {
                  if (err) {
                    console.log(err.message)
                    throw err;
                  }
                });
              });
          }

        let IDFront = null;

        req.files.forEach(({fieldname, filename}) => {
            IDFront = filename;
        })

        const { username, email } = req.body;
        User.findById(req.params.id)
        .then(profileEdit => {
            profileEdit.username = username;
            profileEdit.email = email;
            profileEdit.IDFront = IDFront;

            profileEdit.save()
            .then(edit => {
                res.json({edit});
            });
        })
        .catch(err => {
            res.status(400).json({User : err.message})
        })
    }
);


//post following about creator by viewer
router.post(
    '/:id/following',
    (req, res) => {
        const viewId = req.params.id;
        const { creatorId } = req.body;
        const status = true;
        const userFollowings = new UserFollowing({
            viewId,
            creatorId,
            status,
        })
        userFollowings.save()
        .then(following => res.json(following))
        .catch(err => {res.status(400).json({following: err.message})
        })
    }
)

//get following creators in following section
router.get(
    '/:id/following',
    async (req, res) => {
        const followings = await UserFollowing.find({ viewId: req.params.id });

        if (!followings) {
            return res.status(400).json({UserFollowing : "No found"})
        }
        if (followings) {
            const users = await Promise.all(followings.map(async (following) => {
                const user = await User.findById(following.creatorId);
                return user;
            }));
            console.log(users);
            res.status(200).json({message: 'success', data: users});
    }
});


//pay about subscribe of creator by viewer
router.post(
    '/:id/paySubscribe',
    (req, res) => {
        const {subscribePrice, creatorId} = req.body;
        const viewId = req.params.id;
        const subscribePrices = new TransactionHistory({
            creatorId,
            viewId,
            subscribePrice,
        })
        subscribePrices.save()
        .then(subscribePrice => res.json(subscribePrice))
        .catch(err => {
            res.status(400).json({PaySubscribe: err.message})
        })
    }
)


//edit account info in accountsetting section
router.put(
    '/:id/accontSetting/',
    (req, res) => {
        const { password } = req.body;
        User.findById(req.params.id)
        .then(changePassword => {
            changePassword.password = password;
            changePassword.save()
            .then(changePassword => {
                res.json({changePassword});
            });
        })
        .catch(err => {
            res.status(400).json({User: err.message})
        })
    }
);


//select account type in switch account of account setting section
router.put(
    '/:id/switchAccount/',
    (req, res) => {
        User.findById(req.params.id)
        .then(switchAccount => {
            if(switchAccount.role === "viewer") {
                switchAccount.role = "creator"
            }
            else if(switchAccount.role === "creator"){
                switchAccount.role = "viewer"
            }
            
            switchAccount.save()
            .then(switchAccount => {
                res.json({switchAccount});
            });
        })
        .catch(err => {
            res.status(400).json({User: err.message})
        })
    }
)


//delete account info of current user
router.delete(
    '/:id/accountSetting/',
    async (req, res) => {
        const { password } = req.body;
        User.findById(req.params.id)
        .then(async user => {
            if(password === user.password){
                user.delete()
                .then(() => res.json({success : true}))
            }
            else {
                res.status(200).json({message: 'errror', erroMessage: "password is not match"});
            }
        })
        .catch(err => {
            res.status(400).json({User: err.message})
        })
    }
);


//get subscriber price of current creator
router.get(
    '/:id/subscriber/',
    (req, res) => {
    User.findById(req.params.id)
    .then(subscriber => res.json(subscriber))
    .catch(err=>{console.log(err)
        res.status(400).json({err: err.message});
    });
});

//edit subscriber price of current creator
router.put(
    '/:id/subscriber',
    (req, res) => {
        const { subscriberPrice } = req.body;
        User.findById(req.params.id)
        .then( subscribers => {
            console.log("subPrice", subscribers.subscriberPrice);
            subscribers.subscriberPrice = subscriberPrice;
            subscribers.save()
            .then(
                subscriber => res.json(subscriber)
            )
        })
        .catch(err => res.status(400).json({err: err.message})
        )
    }
)

//get transaction history info
router.get(
    '/:id/getTransactionHistory/',
    (req, res) => {
        TransactionHistory.find()
        .populate(['tips', 'coinamounts'])
        .then(transactionhistory => res.json(transactionhistory))
        .catch(err => {
            res.status(400).json({TransactionHistory: err.message})
        })
    }
)


//buy uve coin by viewer
router.post(
    '/:id/getUveCoin',
    async (req, res) => {
        const viewId = req.params.id;
        const { coinAmount } = req.body;
        const coinAmounts = new CoinAmount({
            viewId,
            coinAmount
        })
        coinAmounts.save()
        .then(coinAmount => res.json(coinAmount))
        .catch(err => {
            res.status(400).json({coinAmount: err.message})
        })
    }
)


//get total uve coins by viewer
router.get(
    '/:id/getUveCoin/',
    (req, res) => {
        CoinAmount.find()
        .then(coinAmount => res.json(coinAmount))
        .catch(err => {
            res.status(400).json({GetUveCoin: err.message})
        })
    }
)

//post message by user in help & support section
router.post(
    '/:id/contact/',
    (req, res) => {
        const userId = req.params.id;
        const { name, email, message } = req.body;
        const date = new Date()
        const contactMessage = new Contact({
            userId,
            name,
            email,
            message,
            date,
        })
        contactMessage.save()
        .then(contact => res.json(contact))
        .catch(err=>{
            res.status(400).json({Contact: err.message});
        });
    }
);



module.exports = router;