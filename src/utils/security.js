import crypto from 'crypto';

// Generating a secure token for streaming urls..
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// signed url wit expiration..
export const generateSignedUrl = (mediaId, fileUrl, expiresInMinutes = 10) => {
  const expiration = Date.now() + (expiresInMinutes * 60 * 1000);
  const token = generateSecureToken();

  // later we can add this to db with some expiration time for better security.. and like cross check when requested
  

  return {
    url: `${process.env.BASE_URL}/stream/${mediaId}?token=${token}&expires=${expiration}`,
    expires: expiration,
    token: token
  };
};

// Validatation
export const validateSignedUrl = (token, expires) => {
  const now = Date.now();
  return now < parseInt(expires);
};