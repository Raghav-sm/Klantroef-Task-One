# medAcess - Media Streaming & Analytics Platform

## Overview

medAcess is a secure media streaming platform with built-in analytics capabilities. It allows authenticated users to upload video and audio files, generate secure streaming URLs, and track view analytics with IP-based tracking.

## Features

- **User Authentication**: JWT-based signup/login system
- **Media Upload**: Support for video and audio files up to 500MB
- **Secure Streaming**: Time-limited signed URLs for media access
- **Analytics**: View tracking with IP logging and analytics dashboard
- **Rate Limiting**: Protection against abuse with configurable limits
- **IP Detection**: Proper client IP detection behind proxies

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer middleware
- **Security**: bcrypt for password hashing, signed URLs
- **Rate Limiting**: express-rate-limit

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd medAcess
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
BASE_URL=http://localhost:5000
PORT=5000
```

4. Create uploads directory:

```bash
mkdir -p uploads/media
```

5. Start the server:

```bash
npm run dev
```
