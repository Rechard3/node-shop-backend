const { Schema, model } = require("mongoose");
const { UserSchema } = require("./user.model");
const { ProductSchema, Product } = require("./product.model");

const embeddedUserSchema = new Schema({
  username: String,
  email: String,
});

const embeddedOrderSchema = new Schema({
  dateOfPurchase: { type: Date, required: true },
  dateOfDelivery: Date,
});

const cartSchema = new Schema({
  items: [
    {
      product: ProductSchema,
      quantity: Number,
    },
  ],
  user: UserSchema,
  order: Schema.Types.ObjectId,
});

cartSchema.methods.addToCart =
  /** @param {Product} prod the product to be added to the cart */
  function cartSchema_addToCart(prod) {
    // check if this product is already in the cart
    const updatedCartItems = [...this.items];
    const prodIdx = updatedCartItems.findIndex(
      (p) => p.product._id.toString() == prod["_id"].toString()
    );
    if (prodIdx >= 0) {
      // increase quantity ordered
      updatedCartItems[prodIdx].quantity = updatedCartItems[prodIdx].quantity + 1;
    } else{
      updatedCartItems.push({product: prod, quantity: 1})
    }
    this.items = updatedCartItems;
    return this;
  };

const Cart = model("Cart", cartSchema);

module.exports = { Cart };
