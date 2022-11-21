const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    password: String,
    username: {
      type: String,
      unique: true,
      match: [/^[a-zA-Z0-9]+$/, "please use a valid username"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
