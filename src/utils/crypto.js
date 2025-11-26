// src/utils/crypto.js
const crypto = require('crypto');

const KDF_ITERATIONS = 310000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';
const ALGO = 'aes-256-gcm';

function generateSalt() {
  return crypto.randomBytes(16).toString('base64');
}

function deriveMasterKey(password, saltB64) {
  const salt = Buffer.from(saltB64, 'base64');
  return crypto.pbkdf2Sync(password, salt, KDF_ITERATIONS, KEY_LENGTH, DIGEST);
}

function generateVaultKey() {
  return crypto.randomBytes(KEY_LENGTH);
}

function wrapVaultKey(masterKey, vaultKey) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, masterKey, iv);

  const enc = Buffer.concat([cipher.update(vaultKey), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const wrapped = Buffer.concat([enc, authTag]);

  return {
    wrappedKeyB64: wrapped.toString('base64'),
    ivB64: iv.toString('base64')
  };
}

function unwrapVaultKey(masterKey, wrappedKeyB64, ivB64) {
  const wrapped = Buffer.from(wrappedKeyB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');

  const authTag = wrapped.slice(wrapped.length - 16);
  const enc = wrapped.slice(0, wrapped.length - 16);

  const decipher = crypto.createDecipheriv(ALGO, masterKey, iv);
  decipher.setAuthTag(authTag);

  const vaultKey = Buffer.concat([decipher.update(enc), decipher.final()]);
  return vaultKey;
}

function encryptItem(vaultKey, payloadObj) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, vaultKey, iv);

  const plaintext = Buffer.from(JSON.stringify(payloadObj), 'utf8');
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertextB64: enc.toString('base64'),
    ivB64: iv.toString('base64'),
    authTagB64: authTag.toString('base64')
  };
}

function decryptItem(vaultKey, ciphertextB64, ivB64, authTagB64) {
  const ciphertext = Buffer.from(ciphertextB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');

  const decipher = crypto.createDecipheriv(ALGO, vaultKey, iv);
  decipher.setAuthTag(authTag);

  const dec = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(dec.toString('utf8'));
}

function createWrappedVaultKeyFromPassword(password) {
  const saltB64 = generateSalt();
  const masterKey = deriveMasterKey(password, saltB64);
  const vaultKey = generateVaultKey();

  const { wrappedKeyB64, ivB64 } = wrapVaultKey(masterKey, vaultKey);

  return {
    saltB64,
    wrappedKeyB64,
    wrappedKeyIvB64: ivB64
  };
}

function deriveVaultKeyFromPassword(password, saltB64, wrappedKeyB64, wrappedKeyIvB64) {
  const masterKey = deriveMasterKey(password, saltB64);
  const vaultKey = unwrapVaultKey(masterKey, wrappedKeyB64, wrappedKeyIvB64);
  return vaultKey;
}

module.exports = {
  createWrappedVaultKeyFromPassword,
  deriveVaultKeyFromPassword,
  encryptItem,
  decryptItem
};
