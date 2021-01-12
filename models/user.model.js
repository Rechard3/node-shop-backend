const mongoose = require("mongoose");
const {Schema} = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
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
    require: true,
    ref: "Cart"
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = {User, UserSchema};