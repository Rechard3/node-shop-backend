const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    validate: async function unique() {
      return new Promise((resolve, reject) => {
        User.findOne({ username: this.username }, (err, result) => {
          if (result) reject("another user with the same name was found");
          else resolve(true);
        });
      });
    },
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  firstName: String,
  lastName: String,
  dateofbirth: Date,
  cart: {
    type: Schema.Types.ObjectId,
    require: false,
    ref: "Cart",
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = { User, UserSchema };
