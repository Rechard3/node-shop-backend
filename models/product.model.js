const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    require: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

module.exports.Product = mongoose.model('Product', productSchema);
