require('dotenv').config();
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

const adminUser = {
  id: '645f1c5b3c8c1234567890ab', 
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin'
};

const token = jwt.sign(
  { id: adminUser.id, role: adminUser.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('Generated JWT token for admin user:');
console.log(token);
console.log('\nTo use this token:');
console.log('1. Open your browser developer tools (F12)');
console.log('2. Navigate to Application tab > Local Storage');
console.log('3. Add a new entry with key "token" and the value above');
console.log('4. Add another entry with key "user" and this value:');
console.log(JSON.stringify(adminUser)); 