const router = require("express").Router();

const bcryptjs = require("bcryptjs");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const { isAnon, isLoggedIn } = require("../middlewares/auth.middlewares");
const Room = require("../models/room.model");
const saltRounds = 10;

router.get("/createroom", isLoggedIn, (req, res, next) => {
  res.render("room/createroom");
});

router.post("/createroom", isLoggedIn, (req, res, next) => {
  if (!req.body.name || !req.body.description) {
    res.render("room/createroom", {
      errorMessage:
        "All fields are mandatory. Please provide your username and password.",
    });
    return;
  }
  Room.findOne({ name: req.body.name })
    .then(() => {
      return Room.create({
        name: req.body.name,
        description: req.body.description,
        owner: req.session.currentUser._id, //session username
      });
    })
    .then((createdRoom) => {
      console.log("created room: ", createdRoom);
      req.session.currentRoom = createdRoom;
      res.redirect("/rooms/roomlist");
    }) //fix username repeat error
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res
          .status(500)
          .render("room/createroom", { errorMessage: err.message });
      } else if (err.code === 11000) {
        res.status(500).render("room/createroom", {
          errorMessage: "name needs to be unique. name  is already used.",
        });
      } else {
        next(err);
      }
    });
});

router.get("/roomlist", (req, res, next) => {
  Room.find().then((allRooms) => {
    let myRooms;
    if (!req.session.currentUser) {
      myRooms = allRooms.map((room) => {
        return {
          ...room._doc,
          isMyRoom: false,
        };
      });
    } else {
      myRooms = allRooms.map((room) => {
        return {
          ...room._doc,
          isMyRoom: room.owner == req.session.currentUser._id,
        };
      });
    }
    res.render("room/roomlist", { myRooms });
  });
});

router.get("/editroom", (req, res, next) => {
  res.render("");
});

router.post("/:name/delete", (req, res, next) => {
  console.log(req.params.name, "PARAMS NAME");
  Room.find({ name: req.params.name })
    .then((foundRoom) => {
      console.log(foundRoom, "FOUND ROOM");
      foundRoom[0].delete();
      res.redirect("/rooms/roomlist");
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
