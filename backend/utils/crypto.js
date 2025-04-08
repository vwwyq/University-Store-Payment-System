// utils/crypto.js
import crypto from 'crypto';

// Use environment variables for the encryption keys
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes (256 bits)
const IV_LENGTH = 16; // For AES, this is always 16 bytes

// Validate encryption key before using
const validateEncryptionKey = () => {
  if (!ENCRYPTION_KEY) {
    console.error('ENCRYPTION_KEY is not set in environment variables');
    return false;
  }
  
  // Check if key is exactly 32 bytes (256 bits)
  const keyBuffer = Buffer.from(ENCRYPTION_KEY);
  if (keyBuffer.length !== 32) {
    console.error(`ENCRYPTION_KEY must be exactly 32 bytes (256 bits). Current length: ${keyBuffer.length} bytes`);
    return false;
  }
  
  return true;
};

export function encrypt(text) {
  // Check if encryption is properly configured
  if (!validateEncryptionKey()) {
    console.warn('Encryption disabled due to invalid key. Returning plaintext.');
    return text;
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Return plaintext as fallback
  }
}

export function decrypt(text) {
  // If text doesn't have the IV separator, it's not encrypted
  if (!text || !text.includes(':')) {
    return text;
  }

  // Check if encryption is properly configured
  if (!validateEncryptionKey()) {
    console.warn('Decryption disabled due to invalid key. Returning input.');
    return text;
  }

  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return text; // Return input as fallback
  }
}