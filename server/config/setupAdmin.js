const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Creates a default admin user if one doesn't already exist
 */
const setupAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('Admin user already exists, skipping creation');
      return;
    }
    
    // Hash the admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
    
    // Create new admin user
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