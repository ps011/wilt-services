const express = require("express");
const user = require("../schemas/user.schema");
const router = express.Router();
const passport = require("../utils/auth-strategies");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/email-configuration");

router.post("/login", passport.authenticate("local"), async (req, res) => {
  res.json({
    token: generateToken(req.body.username),
    user: req.user,
  });
});

router.get("/logout", function (req, res) {
  req.logout();
  res.json({ logout: true });
});

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook"),
  (req, res) => {
    res.json({ token: generateToken(req.body.email) });
  }
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  })
);

router.get("/google/callback", passport.authenticate("google"), (req, res) => {
  res.json({ token: generateToken(req.body.email) });
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

router.post("/create", async (req, res) => {
  try {
    const hash = Math.random().toString(36).slice(2);
    const result = await user.create({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      mobile: req.body.mobile,
      hash,
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"What I Learned Today? 🧠" <email-verification@wilt.com>',
      to: req.body.email,
      subject: "Verify your email address",
      html: `<a href="http://localhost:3000/users/activate/${hash}">Activate Account</a>`,
    });
    res.status(200).send(result);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

router.get("/activate/:hash", async (req, res) => {
  try {
    let inactive = await user.findOne({ hash: req.params.hash });
    inactive.active = true;
    inactive = await user.updateOne({ _id: inactive._id }, inactive);
    res.status(200).send(inactive);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

router.get("/validate", passport.authenticate("jwt"), (req, res) => {
  res.send(req.user);
});

router.get("/:id", passport.authenticate("jwt"), async (req, res) => {
  if (req.user.id === req.params.id) {
    try {
      const result = await user.aggregate([
        { $match: { username: req.user.username } },
        {
          $lookup: {
            from: "wilts",
            localField: "username",
            foreignField: "username",
            as: "wilts",
          },
        },
      ]);
      res.status(200).send(result);
    } catch (e) {
      res.status(404).send(e.message);
    }
  } else {
    try {
      const result = await user.aggregate([
        { $match: { username: req.user.username } },
        {
          $lookup: {
            from: "wilts",
            localField: "username",
            foreignField: "username",
            as: "wilts",
          },
        },
      ]);
      result.password = "";
      res.status(200).send(result);
    } catch (e) {
      res.status(404).send(e.message);
    }
  }
});

router.get("/delete/:id", passport.authenticate("jwt"), async (req, res) => {
  try {
    const result = await user.findByIdAndDelete(req.params.id);
    res.status(200).send(result);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

router.get("/block/:id", passport.authenticate("jwt"), async (req, res) => {
  try {
    let userObj = await user.findById(req.user.id);
    const index = userObj.blocked.indexOf(req.params.id);
    if (index < 0) {
      userObj.blocked.push(req.params.id);
      userObj = await user.findByIdAndUpdate(
        req.user.id,
        {
          blocked: userObj.blocked,
        },
        { new: true, useFindAndModify: true }
      );
    }
    res.status(200).send(userObj);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

router.get("/unblock/:id", passport.authenticate("jwt"), async (req, res) => {
  try {
    let userObj = await user.findById(req.user.id);
    const index = userObj.blocked.indexOf(req.params.id);
    if (index > -1) {
      userObj.blocked.splice(index, 1);
      userObj = await user.findByIdAndUpdate(
        req.user.id,
        {
          blocked: userObj.blocked,
        },
        { new: true }
      );
    }
    res.status(200).send(userObj);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

router.get("/follow/:id", passport.authenticate("jwt"), async (req, res) => {
  try {
    // req.user.id: The User who is following
    // req.params.id: The user who is being followed
    let follower = await user.findById(req.user.id);
    let followee = await user.findById(req.params.id);
    const index = follower.following.indexOf(req.params.id);
    if (index < 0) {
      follower.following.push(req.params.id);
      followee.followers.push(req.user.id);
      follower = await user.findByIdAndUpdate(
        req.user.id,
        {
          following: follower.following,
        },
        { new: true, useFindAndModify: true }
      );
      followee = await user.findByIdAndUpdate(
        req.params.id,
        {
          followers: followee.followers,
        },
        { new: true, useFindAndModify: true }
      );
    }
    res.status(200).send(follower);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

router.get("/unfollow/:id", passport.authenticate("jwt"), async (req, res) => {
  try {
    let unfollower = await user.findById(req.user.id);
    let unfollowee = await user.findById(req.params.id);
    const index = unfollower.following.indexOf(req.params.id);
    if (index > -1) {
      unfollower.following.splice(index, 1);
      unfollowee.followers.splice(unfollowee.followers.indexOf(req.user.id), 1);
      unfollower = await user.findByIdAndUpdate(
        req.user.id,
        {
          following: unfollower.following,
        },
        { new: true }
      );
      unfollowee = await user.findByIdAndUpdate(
        req.params.id,
        {
          followers: unfollower.followers,
        },
        { new: true }
      );
    }
    res.status(200).send(unfollower);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

router.post("/update/:id", passport.authenticate("jwt"), async (req, res) => {
  try {
    const result = await user.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).send(result);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.post("/save", async (req, res) => {
  try {
    const result = await user.findById(req.body.userId);
    if (result.saved_wilts.indexOf(req.body.wiltId) > -1) {
      result.saved_wilts.splice(result.saved_wilts.indexOf(req.body.wiltId), 1);
    } else {
      result.saved_wilts.push(req.body.wiltId);
    }
    await user.update({ _id: req.body.userId }, result, {
      omitUndefined: true,
      multi: false,
    });
    res.status(200).send(result.saved_wilts);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

const generateToken = (payload) => {
  return jwt.sign({ userIdentifier: payload }, process.env.JWT_KEY, {
    expiresIn: "60m",
  });
};

module.exports = router;
