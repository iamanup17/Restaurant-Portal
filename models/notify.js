const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin', 'manager'],
    default: 'admin'
  },
  fcmTokens: {
    type: [String],
    default: [],
    select: false // Don't return this field by default in queries
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add any pre-save hooks or methods you need
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;