# API Design

This document defines all API endpoints for the Goguma backend.

## Base URL

```
https://api.goguma.app/v1
```

For development:
```
http://localhost:3000/api/v1
```

---

## Authentication

All endpoints (except auth endpoints) require authentication via Supabase JWT token.

**Header:**
```
Authorization: Bearer <supabase_jwt_token>
```

---

## Error Response Format

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Endpoints

### Items

#### Create Item
**POST** `/api/v1/items`

Creates a new item for listing.

**Request Body:**
```json
{}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "status": "draft",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### Get Item
**GET** `/api/v1/items/:id`

Gets a single item by ID.

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "status": "draft",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### List Items
**GET** `/api/v1/items`

Lists all items for the authenticated user.

**Query Parameters:**
- `status` (optional) - Filter by status
- `limit` (optional, default: 20) - Number of items per page
- `offset` (optional, default: 0) - Pagination offset

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "status": "draft",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 100
  }
}
```

---

#### Update Item Status
**PATCH** `/api/v1/items/:id`

Updates item status.

**Request Body:**
```json
{
  "status": "processing"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "status": "processing",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### Delete Item
**DELETE** `/api/v1/items/:id`

Deletes an item and all associated data.

**Response:** `204 No Content`

---

### Images

#### Upload Images
**POST** `/api/v1/items/:id/images`

Uploads one or more images for an item.

**Request:** `multipart/form-data`
- `images[]` - Array of image files

**Response:** `201 Created`
```json
{
  "data": [
    {
      "id": "uuid",
      "itemId": "uuid",
      "storagePath": "user_id/item_id/original_image_id.jpg",
      "orderIndex": 0,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Notes:**
- Images are automatically compressed and thumbnails generated
- Creates a background job for processing
- Returns immediately with job ID

---

#### Get Item Images
**GET** `/api/v1/items/:id/images`

Gets all images for an item.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "itemId": "uuid",
      "storagePath": "user_id/item_id/original_image_id.jpg",
      "orderIndex": 0,
      "createdAt": "2024-01-01T00:00:00Z",
      "url": "https://storage.supabase.co/object/public/item-images/..."
    }
  ]
}
```

---

#### Delete Image
**DELETE** `/api/v1/images/:id`

Deletes an image.

**Response:** `204 No Content`

---

#### Reorder Images
**PATCH** `/api/v1/items/:id/images/reorder`

Updates the order of images.

**Request Body:**
```json
{
  "imageIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "success": true
  }
}
```

---

### AI Analysis

#### Trigger AI Analysis
**POST** `/api/v1/items/:id/analyze`

Triggers AI analysis of item images. Creates a background job.

**Request Body:**
```json
{}
```

**Response:** `202 Accepted`
```json
{
  "data": {
    "jobId": "uuid",
    "status": "pending",
    "message": "Analysis job created"
  }
}
```

---

### Listing Drafts

#### Get Listing Draft
**GET** `/api/v1/items/:id/draft`

Gets the listing draft for an item.

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "itemId": "uuid",
    "title": "Vintage Leather Jacket",
    "description": "Beautiful vintage leather jacket in excellent condition...",
    "condition": "Pre-owned",
    "itemSpecifics": {
      "brand": "Levi's",
      "size": "Large",
      "color": "Brown"
    },
    "pricing": {
      "min": 50.00,
      "max": 100.00,
      "suggested": 75.00,
      "confidence": 0.85,
      "currency": "USD"
    },
    "categoryId": "57988",
    "keywords": ["jacket", "leather", "vintage"],
    "aiConfidence": 0.92,
    "visibleFlaws": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### Update Listing Draft
**PUT** `/api/v1/items/:id/draft`

Updates the listing draft. Validates against schema.

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description...",
  "condition": "Pre-owned",
  "itemSpecifics": {
    "brand": "Levi's",
    "size": "Large"
  },
  "pricing": {
    "min": 60.00,
    "max": 90.00,
    "suggested": 75.00,
    "confidence": 0.85,
    "currency": "USD"
  }
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "title": "Updated Title",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Jobs

#### Get Job Status
**GET** `/api/v1/jobs/:id`

Gets the status of a background job.

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "itemId": "uuid",
    "type": "ai_analysis",
    "status": "processing",
    "errorMessage": null,
    "metadata": {},
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "completedAt": null
  }
}
```

---

### eBay Integration

#### Initiate eBay OAuth
**GET** `/api/v1/auth/ebay/connect`

Initiates eBay OAuth flow. Returns redirect URL.

**Response:** `200 OK`
```json
{
  "data": {
    "authUrl": "https://auth.ebay.com/oauth2/authorize?...",
    "state": "random_state_string"
  }
}
```

---

#### eBay OAuth Callback
**GET** `/api/v1/auth/ebay/callback`

Handles eBay OAuth callback. Exchanges code for tokens.

**Query Parameters:**
- `code` - OAuth authorization code
- `state` - State parameter for CSRF protection

**Response:** `200 OK`
```json
{
  "data": {
    "success": true,
    "message": "eBay account connected successfully"
  }
}
```

---

#### Get eBay Account Status
**GET** `/api/v1/auth/ebay/status`

Gets the status of the user's eBay account connection.

**Response:** `200 OK`
```json
{
  "data": {
    "connected": true,
    "ebayUserId": "ebay_user_123",
    "expiresAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### Disconnect eBay Account
**DELETE** `/api/v1/auth/ebay`

Disconnects the user's eBay account.

**Response:** `204 No Content`

---

#### Create eBay Draft Listing
**POST** `/api/v1/items/:id/create-ebay-draft`

Creates a draft listing on eBay. Creates a background job.

**Request Body:**
```json
{}
```

**Response:** `202 Accepted`
```json
{
  "data": {
    "jobId": "uuid",
    "status": "pending",
    "message": "eBay draft creation job created"
  }
}
```

**On Job Completion:**
The job metadata will contain:
```json
{
  "ebayListingId": "123456789",
  "ebayDraftUrl": "https://www.ebay.com/itm/..."
}
```

---

## Rate Limiting

- **AI Analysis:** 10 requests per minute per user
- **Image Upload:** 20 requests per minute per user
- **General API:** 100 requests per minute per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Webhooks (Future)

Webhooks for job completion (optional enhancement):
- `POST /api/v1/webhooks/job-completed` - Called when a job completes

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All UUIDs are v4 format
- Pagination uses offset/limit (can upgrade to cursor-based later)
- Background jobs are polled by clients (can add webhooks later)
- Image URLs are signed URLs from Supabase Storage (expire after 1 hour)

