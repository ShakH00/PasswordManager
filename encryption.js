// Helper module to encrypt/decrypt vault passwords.
const crypto = require('crypto') // 'crypto' is Node's native crypto module
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_SECRET, 'hex') // 32 bytes
const IV_LENGTH = 16 // AES block size standard for encrypting first block

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH) // Get iv to encrypt first block
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv) // Create cypher object using encr key and iv as unique params
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
}
function decrypt(text) {
    const [ivHex, encryptedText] = text.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}
module.exports = {encrypt, decrypt}