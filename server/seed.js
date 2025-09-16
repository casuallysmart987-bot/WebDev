import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Product from './models/Product.js';
import fs from 'fs';


const products = JSON.parse(fs.readFileSync('./data/final.json', 'utf8'));

await mongoose.connect(process.env.MONGO_URI);

await Product.insertMany(products);
console.log('✅ Data seeded');
process.exit();
