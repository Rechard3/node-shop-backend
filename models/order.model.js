const mongoose = require("mongoose");
const {ProductSchema} = require("./product.model");
const { User } = require("./user.model");

const OrderSchema = new mongoose.Schema({
    items: [{product: ProductSchema, quantity: Number}],
    timestamp: Date,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = {
    OrderSchema,
    Order,
}