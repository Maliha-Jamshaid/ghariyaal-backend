const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1'],
  },
}, {
  _id: false,
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
}, {
  timestamps: true,
});

// Add a method to calculate total price
cartSchema.methods.calculateTotal = async function() {
  let total = 0;
  await this.populate('items.product');
  
  for (const item of this.items) {
    total += item.product.price * item.quantity;
  }
  
  return total;
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;