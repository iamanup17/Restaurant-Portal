const crypto = require("crypto");

// Generate a random 32-character encryption key
const encryptionKey = crypto.randomBytes(16).toString("hex");
console.log("Your ENCRYPTION_KEY:", encryptionKey);
