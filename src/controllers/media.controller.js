import { mongoose } from 'mongoose';
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
      viewed_by_ip: req.clientIP 
    });
    await viewLog.save();
    const filePath = mediaAsset.file_url;
    res.setHeader('Content-Type', mediaAsset.type === 'video' ? 'video/mp4' : 'audio/mpeg');
    res.setHeader('Content-Disposition', `inline; filename="${mediaAsset.title}"`);

    res.sendFile(filePath, { root: '.' });
  } catch (error) {
    console.error('Media streaming error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get media analytics with time range support
export const getMediaAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { range = '30d' } = req.query; 

    // Check if media exists
    const mediaAsset = await MediaAsset.findById(id);
    if (!mediaAsset) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Calculate date range
    let startDate = new Date();
    switch (range) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
        startDate = null; // No date filter
        break;
      default:
        return res.status(400).json({ error: 'Invalid range parameter. Use 7d, 30d, 90d, or all' });
    }

    // Build match query
    const matchQuery = { media_id: new mongoose.Types.ObjectId(id) };
    if (startDate) {
      matchQuery.timestamp = { $gte: startDate };
    }
    // Get total views
    const totalViews = await MediaViewLog.countDocuments(matchQuery);
    // Get unique IPs
    const uniqueIPs = await MediaViewLog.distinct('viewed_by_ip', matchQuery);
    // Get views per day
    const viewsPerDay = await MediaViewLog.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$timestamp"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format views per day
    const viewsPerDayFormatted = {};
    viewsPerDay.forEach(day => {
      viewsPerDayFormatted[day._id] = day.count;
    });
    const viewsByCountry = {};

    res.json({
      total_views: totalViews,
      unique_ips: uniqueIPs.length,
      views_per_day: viewsPerDayFormatted,
      views_by_country: viewsByCountry,
      date_range: {
        start: startDate,
        end: new Date()
      }
    });
  } catch (error) {
    console.error('Media analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Log a media view
export const logView = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if media exists
    const mediaAsset = await MediaAsset.findById(id);
    if (!mediaAsset) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Create view log entry
    const viewLog = new MediaViewLog({
      media_id: id,
      viewed_by_ip: req.clientIP 
    });

    await viewLog.save();

    res.status(200).json({
      message: 'View logged successfully',
      view: {
        media_id: id,
        viewed_at: viewLog.timestamp,
        viewed_by_ip: viewLog.viewed_by_ip 
      }
    });
  } catch (error) {
    console.error('View logging error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};