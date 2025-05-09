const crypto = require('crypto');

const generateSecureSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

const secretKey = generateSecureSecret();

console.log('\nGenerated JWT_SECRET:');
console.log('====================');
console.log(secretKey);
console.log('\nCopy this value into your .env file as:');
console.log(`JWT_SECRET=${secretKey}`);
console.log('\n'); 