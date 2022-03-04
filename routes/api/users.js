const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport')
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require("nodemailer");

const saltRounds = 10;
const {
  expiredAfter,
  secretKey,
  domain,
  dev,
} = require("../../config/config.site");

const transporter = nodemailer.createTransport({
  host: "uvuew.com",
  port: "465",
  secure: true, // use TLS
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: "hello@uvuew.com",
    pass: "eUY,D@mXbv_6",
  },
});

const sendMailUrl = (email, title, url) => {
  const html = `<div style='display: flex; justify-content: center;'>
                  <a href='${url}' style='text-decoration: none; background-color: green; padding: 10px 20px; border-radius: 5px; color: white;'>${title}</a>\
                </div>`;
  sendMail(email, title, html, url)
};

const sendMail = (email, title, html, url) => {
  if (!dev) {
    transporter.sendMail(
      {
        from: "hello@uvuew.com",
        to: email,
        subject: title,
        html: html,
      },
      function (err, result) {
        if (err) console.log(err);
        else {
          console.log("success send to email");
          console.log("from", "hello@uvuew.com");
          console.log("to", email);
        }
      }
    );
  } else {
    console.log(url);
    console.log(title);
  }
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/files')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
})

const upload = multer({storage});


//get sing up users info
router.get('/getSignUp', 
  (req, res) => {
      User.find().sort({ date: 1 })
      .then(users=>res.json(users))
      .catch(err=>{console.log(err)
        res.status(404).json({err: 'no found'});
    });
  }
);


//get user info from token
router.get('/getCurrenty',
    passport.authenticate("jwt", {session: false}),
    (req, res) => {
      res.json({
        id: req.user.id,
        name: req.user.email,
        email: req.user.email,
      });
    }
)


//post user info by sign up
router.post('/signUp',
  upload.any('file'),
  check('username', 'username is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check(
    'password',
    'Please enter a password with 6 or more characters'
  ).isLength({ min: 6 }),
  async (req, res) => {
    if(req.IDFront && req.IDFront.length > 0) {
      req
        .IDFront
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
          IDFront.push(filename_new + ext);
          fs.rename(tempPath, targetPath, function (err) {
            if (err) {
              console.log(err.message)
              throw err;
            }
          });
        });
    }
    if(req.IDBack && req.IDBack.length > 0) {
      req
        .IDBack
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
          IDBack.push(filename_new + ext);
          fs.rename(tempPath, targetPath, function (err) {
            if (err) {
              throw err;
            }
          });
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let IDFront = null;
    let IDBack = null;

    req.files.forEach(({fieldname, filename}) => {
      if (fieldname === 'IDFront') {
        IDFront = filename
      }
      else if (fieldname === 'IDBack') {
        IDBack = filename
      }
    })

    const { username, email, password, role, setupUsername, birth, viewerAge, IDType, CategoryType } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      const date = new Date();
      user = new User({
        username,
        email,
        password,
        role,
        setupUsername,
        birth,
        viewerAge,
        IDType,
        IDFront,
        IDBack,
        CategoryType,
        date
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      const result = await user.save();

      //token(verify url) create
      const mailCode = jwt.sign({
        id: result._id,
        expiredAt: new Date().getTime() + expiredAfter,
        email: result.email,
      }, secretKey);
      // send the mail here
      let url = `${domain}/verifyEmail/${mailCode}`;
      let title = "Verify Email";
      sendMailUrl(user.email, title, url);
      res.status(200).json({
        message: "User added successfully!!!",
        data: null,
      });

      const payload = {
        user: {
          id: user._id,
          password: user.password
        }
      };
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });


// email verify
router.get('/verify',
    async (req, res) => {
    const { token } = req.body
      jwt.verify(token, secretKey, async (error, decoded) => {
        if (!error) {
          const { id, expiredAt, email } = decoded;
          if (expiredAt > new Date().getTime()) {
            const user = await User.findOne({ _id: id });
            if (user.email = email) {
              await User.findByIdAndUpdate(id, {confirm: true})
              res.status(200).json({ message: null, data: user });
              return
            }
            res.status(400).json({ message: "incorrect token", data: null });
          }
          else {
            res.status(400).json({ message: "token expired", data: null });
          }
        }
        res.status(400).json({ message: "incorrect token", data: null });
      });
    },
  );


//get logined user info
router.get('/login', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


//post login info
router.post('/login',
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Email' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Password' }] });
      }

      const payload = {
        user: {
          id: user.id
        }
      };
      const id = payload.user;
      const userId = id.id;
      jwt.sign(
        id,
        config.get('jwtSecret'),
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({ token, userId });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);


//forgoten password - email send
router.post('/forgotPassword',
  async (req, res) => {
    const user = req.body;
    const userInfo = await User.findOne({ email: user.email })
      if (userInfo) {
        const mailCode = jwt.sign({
          id: userInfo._id,
          expiredAt: new Date().getTime() + expiredAfter,
          email: userInfo.email,
          name: userInfo.name,
        }, secretKey);
        // send the mail here
        let url = `${domain}/resetPassword/${mailCode}`;
        let title = "Reset Password"
        if (!dev) {
          const html = `<div style='display: flex; justify-content: center;'>\
                          <a href='${url}' style='text-decoration: none; background-color: green; padding: 10px 20px; border-radius: 5px; color: white;'>${title}</a>\
                        </div>`
          transporter.sendMail({
            from: "hello@uvuew.com",
            to: user.email,
            subject: title,
            html: html,
          }, function (err, result) {
            if (err)
              console.log(err)
            else {
              console.log('success send to email');
              console.log('from', "hello@uvuew.com")
              console.log('to', user.email)
            }
          });
        }
        else {
          console.log(url)
          console.log(title)
        }
        res.status(200).json({
          message: "User added successfully!!!",
          data: {id: userInfo._id},
        });
      }
      else {
        res.status(400).json({ message: "This user don't exist." });
      }
  }
);


//forgoten password - password change
router.post('/changePassword',
  async (req, res) => {
    const user = req.body
    const userInfo = await User.findOne({ _id: user._id })
        if (
          userInfo != null &&
          bcrypt.compareSync(user.password, userInfo.password)
        ) {
          let newPassword = bcrypt.hashSync(user.newPassword, saltRounds);
          User.findByIdAndUpdate(userInfo._id, { password: newPassword }, function (err, result) {
            if (err) res.status(400).json({ message: "Update password failed", data: null });
            else {
              res
                .status(200)
                .json({ message: "Password is updated successfully!", data: { id: result._id } });
            }
          })
        }
        else {
          res.status(400).json({ message: "Invalid email/password!", data: null });
        }
      }
)

module.exports = router;
