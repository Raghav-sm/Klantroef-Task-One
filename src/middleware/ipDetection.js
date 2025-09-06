// Middleware to properly detect client IP address
export const detectClientIP = (req, res, next) => {
  // Get client IP considering proxies
  const clientIP = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  // Clean IP address (remove IPv6 prefix if present)
  req.clientIP = clientIP ? clientIP.toString().replace('::ffff:', '') : 'unknown';
  next();
};