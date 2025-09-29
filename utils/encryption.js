// utils/encryption.js
const crypto = require("crypto");

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "1167d13e221c53c3dca391607264ffc6"; // Must be 32 characters
const IV_LENGTH = 16; // IV length for AES-256-CBC

// Function to encrypt text
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH); // Generate a random IV
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "utf8"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`; // Return IV:EncryptedText
}

// Function to decrypt text
function decrypt(text) {
  try {
    if (!text) {
      throw new Error("Encrypted text is empty or undefined");
    }

    const textParts = text.split(":");
    if (textParts.length !== 2) {
      throw new Error(
        "Invalid encrypted text format. Expected IV:EncryptedText"
      );
    }

    const iv = Buffer.from(textParts[0], "hex"); // Extract IV
    const encryptedText = Buffer.from(textParts[1], "hex"); // Extract encrypted text

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY, "utf8"),
      iv
    );

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error.message);
    throw new Error("Failed to decrypt text");
  }
}

module.exports = { encrypt, decrypt };
