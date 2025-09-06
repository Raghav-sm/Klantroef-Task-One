// required stff according to task 1.. AdminUser: id, email, hashed_password, created_at 

import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  hashed_password: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

adminUserSchema.index({ email: 1 }); // index because its useful when we having queries to deal with..

export default mongoose.model('AdminUser',adminUserSchema);