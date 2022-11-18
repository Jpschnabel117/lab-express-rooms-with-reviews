const router = require("express").Router();

const bcryptjs = require("bcryptjs");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const { isAnon, isLoggedIn } = require("../middlewares/auth.middlewares");
const saltRounds = 10;

router.get("/signup", isAnon, (req, res, next) => {
  req.session.myfavoritecolor = "green"; //this is a test
  res.render("auth/signup");
});

//creating new user route
router.post("/signup", isAnon, (req, res, next) => {
  if (!req.body.username || !req.body.password || !req.body.email) {
    res.render("auth/signup", {
      errorMessage:
        "All fields are mandatory. Please provide your username and password.",
    });
    return;
  }
  //check password strength
  // const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  // if (!regex.test(req.body.password)) {
  //   res.status(500).render("auth/signup", {
  //     errorMessage:
  //       "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
  //   });
  //   return;
  // }
  console.log(req.body);
  User.findOne({ username: req.body.username })
    .then(() => {
      return bcryptjs.genSalt(saltRounds);
    })
    .then((salt) => {
      return bcryptjs.hash(req.body.password, salt);
    })
    .then((hashedPassword) => {
      return User.create({
        email: req.body.email,
        username: req.body.username,
        password: hashedPassword,
      });
    })
    .then((createdUser) => {
      console.log("created user: ", createdUser);
      res.redirect("/userProfile");
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(500).render("auth/signup", { errorMessage: err.message });
      } else if (err.code === 11000) {
        res.status(500).render("auth/signup", {
          errorMessage:
            "Username needs to be unique. Username  is already used.",
        });
      } else {
        next(err);
      }
    });
});

router.get("/userProfile", isLoggedIn, (req, res) => {
  res.render("user-profile", {
    userInSession: req.session.currentUser,
  });
});

module.exports = router;
