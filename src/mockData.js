const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const Product = require('./models/productModel');
const Order = require('./models/orderModel');

// Load env
dotenv.config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ghariyaal';

const users = [
  {
    name: 'Admin User',
    email: 'admin@ghariyaal.com',
    password: bcrypt.hashSync('AdminPass123', 12),
    role: 'admin',
  },
  {
    name: 'Customer User',
    email: 'customer@ghariyaal.com',
    password: bcrypt.hashSync('CustomerPass123', 12),
    role: 'customer',
  },
];

const products = [
  {
    name: 'Classic Men Watch',
    description: 'Elegant classic watch for men with leather strap.',
    price: 120,
    category: 'Men',
    imageUrl: 'https://example.com/men1.jpg',
    stock: 10,
  },
  {
    name: 'Sporty Men Watch',
    description: 'Sporty and durable watch for men.',
    price: 150,
    category: 'Men',
    imageUrl: 'https://example.com/men2.jpg',
    stock: 8,
  },
  {
    name: 'Elegant Women Watch',
    description: 'Elegant watch for women with gold finish.',
    price: 130,
    category: 'Women',
    imageUrl: 'https://example.com/women1.jpg',
    stock: 12,
  },
  {
    name: 'Casual Women Watch',
    description: 'Casual and stylish watch for women.',
    price: 90,
    category: 'Women',
    imageUrl: 'https://example.com/women2.jpg',
    stock: 15,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Clear collections
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    // Insert users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0];
    const customerUser = createdUsers[1];

    // Insert products
    const createdProducts = await Product.insertMany(products);

    // Create an order for the customer
    const order = await Order.create({
      user: customerUser._id,
      items: [
        {
          product: createdProducts[0]._id,
          quantity: 1,
          price: createdProducts[0].price,
        },
        {
          product: createdProducts[2]._id,
          quantity: 2,
          price: createdProducts[2].price,
        },
      ],
      totalPrice: createdProducts[0].price * 1 + createdProducts[2].price * 2,
      address: {
        street: '123 Main St',
        city: 'Karachi',
        state: 'Sindh',
        zipCode: '75500',
        country: 'Pakistan',
      },
      status: 'Pending',
      paymentMethod: 'Cash on Delivery',
    });

    console.log('Mock data inserted!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
