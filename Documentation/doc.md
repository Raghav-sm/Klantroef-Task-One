## API Documentation

### Authentication Endpoints

#### Sign Up

- **URL**: `POST /auth/signup`
- **Headers**: `Content-Type: application/json`
- **Body**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

- **Response**:

```json
{
  "message": "User created successfully",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

#### Login

- **URL**: `POST /auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

- **Response**:

```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

### Media Endpoints

#### Upload Media

- **URL**: `POST /media`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Body** (form-data):
  - `media`: File (video or audio)
  - `title`: String
  - `type`: String ("video" or "audio")
- **Response**:

```json
{
  "message": "Media uploaded successfully.",
  "media": {
    "id": "media_id",
    "title": "Media Title",
    "type": "video",
    "file_url": "/uploads/media/filename",
    "created_at": "timestamp"
  }
}
```

#### Generate Streaming URL

- **URL**: `GET /media/:id/stream-url`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:

```json
{
  "stream_url": "http://localhost:5000/stream/media_id?token=abc123&expires=1234567890",
  "expires": 1234567890
}
```

#### Stream Media

- **URL**: Use the URL from generateStreamUrl
- **Example**: `GET /stream/:id?token=abc123&expires=1234567890`
- **Response**: Streams the media file directly

#### Get Analytics

- **URL**: `GET /media/:id/analytics?range=7d`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `range`: Optional (7d, 30d, 90d, all) - Default: 30d
- **Response**:

```json
{
  "total_views": 100,
  "unique_ips": 50,
  "views_per_day": {
    "2023-01-01": 10,
    "2023-01-02": 20
  },
  "views_by_country": {},
  "date_range": {
    "start": "2023-01-01T00:00:00.000Z",
    "end": "2023-01-30T00:00:00.000Z"
  }
}
```

#### Log View

- **URL**: `GET /media/:id/views`
- **Response**:

```json
{
  "message": "View logged successfully",
  "view": {
    "media_id": "media_id",
    "viewed_at": "timestamp",
    "viewed_by_ip": "client_ip"
  }
}
```

## Postman Setup Guide

### Environment Setup

1. Open Postman and create a new environment called "medAcess"
2. Add the following variables:
   - `baseUrl`: `http://localhost:5000`
   - `token`: (leave empty, will be set automatically)

### Collection Setup

1. Create a new collection called "medAcess API"
2. Add the following requests:

#### Authentication Requests

- **Sign Up**

  - Method: POST
  - URL: `{{baseUrl}}/auth/signup`
  - Body: raw JSON

  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```

- **Login**
  - Method: POST
  - URL: `{{baseUrl}}/auth/login`
  - Body: raw JSON
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
  - Tests (to automatically set token):
  ```javascript
  if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
  }
  ```

#### Media Requests

- **Upload Media**

  - Method: POST
  - URL: `{{baseUrl}}/media`
  - Headers:
    - `Authorization`: `Bearer {{token}}`
  - Body: form-data
    - Key: `media`, Type: File, Value: [select file]
    - Key: `title`, Value: "My Video"
    - Key: `type`, Value: "video"

- **Generate Streaming URL**

  - Method: GET
  - URL: `{{baseUrl}}/media/:id/stream-url`
  - Headers:
    - `Authorization`: `Bearer {{token}}`
  - Replace `:id` with actual media ID

- **Get Analytics**

  - Method: GET
  - URL: `{{baseUrl}}/media/:id/analytics?range=7d`
  - Headers:
    - `Authorization`: `Bearer {{token}}`
  - Replace `:id` with actual media ID

- **Log View**
  - Method: GET
  - URL: `{{baseUrl}}/media/:id/views`
  - Replace `:id` with actual media ID

## Database Models

### AdminUser

- `id`: ObjectId
- `email`: String (unique)
- `hashed_password`: String
- `created_at`: Date

### MediaAsset

- `id`: ObjectId
- `title`: String
- `type`: String (enum: ['video', 'audio'])
- `file_url`: String
- `uploaded_by`: ObjectId (ref: AdminUser)
- `created_at`: Date

### MediaViewLog

- `id`: ObjectId
- `media_id`: ObjectId (ref: MediaAsset)
- `viewed_by_ip`: String
- `timestamp`: Date

## Security Features

- JWT authentication with 24-hour expiration
- Secure signed URLs for media streaming with expiration
- Rate limiting on authentication and upload endpoints
- IP-based view tracking
- File type validation for uploads
- Proper IP detection behind proxies

## Error Handling

The API returns appropriate HTTP status codes with JSON error messages:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

## Rate Limits

- General: 100 requests per 15 minutes per IP
- Authentication: 5 attempts per 15 minutes per IP
- Media Upload: 10 uploads per hour per user

## File Structure

```
src/
├── controllers/
│   ├── auth.controller.js
│   └── media.controller.js
├── middleware/
│   ├── auth.js
│   ├── ipDetection.js
│   ├── logger.js
│   ├── rateLimiter.js
│   └── upload.js
├── models/
│   ├── AdminUser.model.js
│   ├── MediaAsset.model.js
│   └── MediaViewLog.model.js
├── routes/
│   ├── auth.route.js
│   └── media.route.js
├── utils/
│   └── security.js
├── app.js
└── server.js
```
