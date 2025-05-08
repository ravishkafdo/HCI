const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');


const setupAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('Admin user already exists, skipping creation');
      return;
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
    
    const adminUser = new User({
      _id: process.env.ADMIN_ID || new mongoose.Types.ObjectId(),
      name: process.env.ADMIN_NAME || 'Admin User',
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('Default admin user created successfully');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

module.exports = setupAdminUser; 