// required ... MediaAsset: id, title, type(video / audio), file_url, created_at

import mongoose from 'mongoose';

const mediaAssetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['video', 'audio']
  },
  file_url: {
    type: String,
    required: true
  },
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

mediaAssetSchema.index({ uploaded_by: 1, created_at: -1 });

export default mongoose.model('MediaAsset', mediaAssetSchema);