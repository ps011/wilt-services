const express = require('express');
const user = require('../schemas/user.schema');
const router = express.Router();
const passport = require('../utils/auth-strategies');
const jwt = require('jsonwebtoken');


router.post('/login', passport.authenticate('local'), async (req, res) => {
  res.json({token: generateToken(req.body.username), user: { username: req.user.username, email: req.user.email, id: req.user._id}});
});

router.get('/logout', function(req, res) {
  req.logout();
  res.json({logout: true});
});

router.get('/facebook', passport.authenticate('facebook', { scope : ['email'] }));

router.get('/facebook/callback', passport.authenticate('facebook'), (req, res) => {
  res.json({token: generateToken(req.body.email)});
});

router.get('/google', passport.authenticate('google', {  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ] }));

router.get('/google/callback', passport.authenticate('google'), (req, res) => {
  res.json({token: generateToken(req.body.email)});
    });

// Disabling route to get list of all users
// router.get('/', async (req, res) => {
//   try {
//     const result = await user.find({});
//     res.status(200).send(result);
//   } catch (e) {
//     res.status(404).send(e.message);
//   }
// });

router.post('/create', async (req, res) => {
  try {
    const result = await user.create({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      mobile: req.body.mobile,
    });
    res.status(200).send(result);
  } catch (e) {
    res.status(404).send(e.message);
  }
});


router.get('/validate', passport.authenticate('jwt'), (req, res) => {
  res.send(req.user);
});


router.get('/:id', passport.authenticate('jwt'), async (req, res) => {
  if (req.user._id == req.params.id) {
    try {
      const result = await user.findById(req.params.id);
      res.status(200).send(result);
    } catch (e) {
      res.status(404).send(e.message);
    }
  } else {
    res.status(401).send('Unauthorized');
  }
});

router.get('/delete/:id', passport.authenticate('jwt'), async (req, res) => {
  try {
    const result = await user.findByIdAndDelete(req.params.id);
    res.status(200).send(result);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

router.post('/update/:id', passport.authenticate('jwt'), async (req, res) => {
  try {
    const result = await user.findByIdAndUpdate(req.params.id, req.body, {new: true})
    res.status(200).send(result);
  } catch (e) {
    res.status(404).send(e)
  }
});

router.post('/save', async(req, res) => {
  try {
      const result = await user.findById(req.body.userId);
      if (result.saved_wilts.indexOf(req.body.wiltId) > -1) {
        result.saved_wilts.splice(result.saved_wilts.indexOf(req.body.wiltId), 1);
      } else {
        result.saved_wilts.push(req.body.wiltId);
      }
      await user.update({ _id: req.body.userId }, result, {omitUndefined: true, multi: false})
      res.status(200).send(result.saved_wilts);
  } catch (e) {
      res.status(404).send(e.message);
  }
});

const generateToken = (payload) => {
  return jwt.sign({userIdentifier: payload}, process.env.JWT_KEY, {expiresIn: '60m'});
};


module.exports = router;