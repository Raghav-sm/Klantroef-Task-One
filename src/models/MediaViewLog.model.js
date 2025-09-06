import mongoose from 'mongoose';

const mediaViewLogSchema = new mongoose.Schema({
  media_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset',
    required: true
  },
  viewed_by_ip: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

mediaViewLogSchema.index({ media_id: 1, timestamp: -1 });

export default mongoose.model('MediaViewLog', mediaViewLogSchema);