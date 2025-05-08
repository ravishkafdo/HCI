/**
 * JWT Secret Key Generator
 * 
 * This script generates a secure random string suitable for use as a JWT_SECRET.
 * Run with: node generate-secret.js
 */

const crypto = require('crypto');

// Generate a random string of 64 characters (32 bytes converted to hex)
const generateSecureSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate a secure random secret
const secretKey = generateSecureSecret();

console.log('\nGenerated JWT_SECRET:');
console.log('====================');
console.log(secretKey);
console.log('\nCopy this value into your .env file as:');
console.log(`JWT_SECRET=${secretKey}`);
console.log('\n'); 