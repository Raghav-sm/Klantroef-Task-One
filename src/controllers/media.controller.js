import MediaAsset from '../models/MediaAsset.model.js';
import MediaViewLog from '../models/MediaViewLog.model.js';
import { generateSignedUrl, validateSignedUrl } from '../utils/security.js';

// Upload media
export const uploadMedia = async (req, res) => {
  try {
    const { title, type } = req.body;

    //incase any field is missing..
    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Media file is required' });
    }

    // Creates media asset record..
    const mediaAsset = new MediaAsset({
      title,
      type,
      file_url: `/uploads/media/${req.file.filename}`,
      uploaded_by: req.user._id
    });
    await mediaAsset.save();

    res.status(201).json({
      message: 'Media uploaded successfully.',
      media: {
        id: mediaAsset._id,
        title: mediaAsset.title,
        type: mediaAsset.type,
        file_url: mediaAsset.file_url,
        created_at: mediaAsset.created_at
      }
    });
  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Generates secure streaming url...
export const generateStreamUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const mediaAsset = await MediaAsset.findById(id);
    if (!mediaAsset) {
      return res.status(404).json({ error: 'Media not found' });
    }
    // Generate signed url 
    const signedUrl = generateSignedUrl(id, mediaAsset.file_url);

    res.json({
      stream_url: signedUrl.url,
      expires: signedUrl.expires
    });
  } catch (error) {
    console.error('Stream URL generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Stream media (protected by token)
export const streamMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { token, expires } = req.query;

    if (!token || !expires) {
      return res.status(400).json({ error: 'Token and expiration are required' });
    }
    // Validate token and expiration
    if (!validateSignedUrl(token, expires)) {
      return res.status(403).json({ error: 'URL has expired or is invalid' });
    }

    const mediaAsset = await MediaAsset.findById(id);
    if (!mediaAsset) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Log the view
    const viewLog = new MediaViewLog({
      media_id: id,
      viewed_by_ip: req.ip
    });
    await viewLog.save();
    const filePath = `uploads/media/${mediaAsset.file_url.split('/').pop()}`;
    res.setHeader('Content-Type', mediaAsset.type === 'video' ? 'video/mp4' : 'audio/mpeg');
    res.setHeader('Content-Disposition', `inline; filename="${mediaAsset.title}"`);

    res.sendFile(filePath, { root: '.' });
  } catch (error) {
    console.error('Media streaming error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get media analytics
export const getMediaAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const mediaAsset = await MediaAsset.findById(id);
    if (!mediaAsset) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Get view count and recent views
    const viewCount = await MediaViewLog.countDocuments({ media_id: id });
    const recentViews = await MediaViewLog.find({ media_id: id })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      media: {
        id: mediaAsset._id,
        title: mediaAsset.title,
        type: mediaAsset.type,
        created_at: mediaAsset.created_at
      },
      analytics: {
        total_views: viewCount,
        recent_views: recentViews
      }
    });
  } catch (error) {
    console.error('Media analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};