// hashPassword.js
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

async function generateHash(password) {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
}

// Get password from command-line arguments
const password = process.argv[2];
if (!password) {
    console.error('Usage: node hashPassword.js <password>');
    process.exit(1);
}

generateHash(password).then(hash => {
    console.log('Hashed password:', Buffer.from(hash).toString('base64'));
});
