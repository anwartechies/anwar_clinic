# Google Reviews Integration — React + Node/Express

## Goal

Implement Google Reviews on the website using Google Places API (New).

Architecture:

React/Vite → Node/Express backend → Google Places API

The Google API key must stay on the backend and must never be exposed in React/Vite.

---

## 1. Google Cloud Setup

Create/select a Google Cloud project.

Enable:

- Places API (New)

Create an API key.

Restrict the key to:

- Places API (New)

For production, apply appropriate server-side restrictions where possible.

---

## 2. Required Google Values

You need:

```env
GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_API_KEY
GOOGLE_PLACE_ID=YOUR_GOOGLE_PLACE_ID
```

### API Key

Create it from:

Google Cloud Console → APIs & Services → Credentials → Create Credentials → API Key

Do NOT put the key in:

```env
VITE_GOOGLE_API_KEY=...
```

Do NOT expose it in React.

### Place ID

Get the Google Place ID for the clinic/business.

Example:

```text
ChIJxxxxxxxxxxxxxxxx
```

Store only the Place ID in configuration/database as needed.

---

## 3. Backend Environment

Create:

```text
server/.env
```

Example:

```env
PORT=5000
GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_API_KEY
GOOGLE_PLACE_ID=YOUR_GOOGLE_PLACE_ID
```

Add `.env` to `.gitignore`:

```gitignore
.env
node_modules
```

Never commit the API key to GitHub.

---

## 4. Backend Dependencies

```bash
npm install express cors dotenv
```

Modern Node.js can use built-in `fetch`.

---

## 5. Backend Endpoint

Create:

```text
GET /api/google-reviews
```

Example implementation:

```js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/google-reviews", async (req, res) => {
  try {
    const placeId = process.env.GOOGLE_PLACE_ID;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!placeId || !apiKey) {
      return res.status(500).json({
        message: "Google Places configuration is missing",
      });
    }

    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "displayName,rating,userRatingCount,reviews,googleMapsLinks",
      },
    });

    if (!response.ok) {
      const error = await response.text();

      console.error("Google Places API error:", error);

      return res.status(response.status).json({
        message: "Unable to fetch Google reviews",
      });
    }

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("Google reviews error:", error);

    res.status(500).json({
      message: "Server error while fetching Google reviews",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 6. Google Places Request

The backend calls:

```text
GET https://places.googleapis.com/v1/places/{PLACE_ID}
```

Required headers:

```text
X-Goog-Api-Key: GOOGLE_PLACES_API_KEY
X-Goog-FieldMask: displayName,rating,userRatingCount,reviews,googleMapsLinks
```

Only request the fields actually needed.

---

## 7. Data Needed by Frontend

The frontend needs:

### Business

```text
displayName
rating
userRatingCount
```

### Reviews

For each review:

```text
rating
text
relativePublishTimeDescription
authorAttribution.displayName
authorAttribution.uri
authorAttribution.photoUri
googleMapsUri
```

Use the returned Google data rather than manually creating fake review content.

---

## 8. React Integration

React should call your backend:

```js
const response = await fetch(
  "http://localhost:5000/api/google-reviews"
);

const data = await response.json();
```

Do NOT call:

```text
https://places.googleapis.com/...
```

directly from React with the secret API key.

---

## 9. Recommended React State

```js
const [reviews, setReviews] = useState([]);
const [rating, setRating] = useState(null);
const [reviewCount, setReviewCount] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

Fetch on component mount.

Handle:

- Loading
- Success
- Empty reviews
- API error
- Network error

---

## 10. Review Card Functionality

Each Google review card should display:

```text
Reviewer photo
Reviewer name
Star rating
Review text
Relative publish time
View review on Google
```

Example:

```jsx
<a
  href={review.authorAttribution?.uri}
  target="_blank"
  rel="noopener noreferrer"
>
  {review.authorAttribution?.displayName}
</a>
```

Review source:

```jsx
<a
  href={review.googleMapsUri}
  target="_blank"
  rel="noopener noreferrer"
>
  View review on Google Maps
</a>
```

---

## 11. Overall Rating

Display:

```text
4.9 ★★★★★
Based on 625 Google reviews
```

Values come from:

```js
data.rating
data.userRatingCount
```

Do not hard-code the Google rating or review count.

---

## 12. Read All Reviews

Add a button such as:

```text
Read all Google Reviews
```

Use the Google Maps review/place URL returned by the API when available.

The purpose is to let visitors see the complete Google review listing because the Places API does not provide unlimited individual reviews.

---

## 13. Google Attribution

When displaying Google review content:

- Keep Google attribution visible.
- Keep reviewer attribution visible.
- Link the reviewer/source where provided.
- Provide a link back to Google Maps/review source.
- Follow Google's current Places API attribution and content policies.

Do not make Google reviews look like original testimonials owned by the website.

---

## 14. Important Review Limitation

The Places API provides only a limited set of individual reviews rather than the entire review history.

Therefore:

```text
Overall rating/count
        ↓
Google Places API

Individual review cards
        ↓
Limited reviews returned by API

All reviews
        ↓
Google Maps link
```

For a homepage, this is normally sufficient.

---

## 15. Do Not Permanently Copy All Google Reviews

Avoid this architecture:

```text
Google
  ↓
Download every review
  ↓
PostgreSQL
  ↓
Permanent copy
```

Google Places content has storage/caching and attribution requirements.

Use the API response for the website and follow Google's current policies.

The Google Place ID can be stored for future API requests.

---

## 16. Recommended Component Structure

```text
src/
├── components/
│   └── GoogleReviews/
│       ├── GoogleReviews.jsx
│       ├── GoogleReviewCard.jsx
│       └── googleReviews.css
```

Optional API helper:

```text
src/
└── services/
    └── googleReviewsApi.js
```

Example:

```js
export async function getGoogleReviews() {
  const response = await fetch(
    "http://localhost:5000/api/google-reviews"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Google reviews");
  }

  return response.json();
}
```

---

## 17. Production Configuration

Development:

```text
React
http://localhost:5173

Node
http://localhost:5000
```

Production:

```text
React
https://yourdomain.com

Node
https://api.yourdomain.com
```

Change the frontend API URL using environment configuration.

Example:

```env
VITE_API_URL=https://api.yourdomain.com
```

This frontend variable is safe because it contains the backend URL, not the Google secret.

Use:

```js
fetch(`${import.meta.env.VITE_API_URL}/api/google-reviews`);
```

Never put:

```env
VITE_GOOGLE_PLACES_API_KEY=...
```

in the frontend.

---

## 18. CORS

During development:

```js
app.use(cors());
```

For production, restrict CORS to the actual website origin.

Example:

```js
app.use(
  cors({
    origin: "https://yourdomain.com",
  })
);
```

---

## 19. Error Handling

Backend should return a clean response to React.

Example:

```json
{
  "message": "Unable to fetch Google reviews"
}
```

Frontend should show a graceful fallback instead of breaking the page.

Example:

```text
Google reviews are temporarily unavailable.
```

Do not expose:

- Google API keys
- Internal server errors
- API credentials
- Request headers

to the browser.

---

## 20. Final Functionality Checklist

### Google Cloud

- [ ] Google Cloud project created
- [ ] Places API (New) enabled
- [ ] API key created
- [ ] API key restricted
- [ ] Business Place ID obtained
- [ ] Billing/configuration completed

### Backend

- [ ] `.env` created
- [ ] API key stored only in backend
- [ ] Place ID configured
- [ ] `/api/google-reviews` endpoint created
- [ ] Google FieldMask configured
- [ ] Error handling added
- [ ] CORS configured

### React

- [ ] Fetch backend reviews
- [ ] Loading state
- [ ] Error state
- [ ] Overall rating
- [ ] Review count
- [ ] Review cards
- [ ] Reviewer name
- [ ] Reviewer photo
- [ ] Star rating
- [ ] Review text
- [ ] Review date/time
- [ ] Link to original Google review
- [ ] Google attribution
- [ ] Link to all Google reviews

### Security

- [ ] API key NOT in React
- [ ] API key NOT in Vite environment variables
- [ ] `.env` in `.gitignore`
- [ ] API key restricted in Google Cloud
- [ ] Production CORS restricted
- [ ] Google attribution preserved

---

## 21. Minimal API Flow

```text
Browser
   |
   | GET /api/google-reviews
   v
Node / Express
   |
   | X-Goog-Api-Key: SECRET_KEY
   | X-Goog-FieldMask: required fields
   v
Google Places API
   |
   | rating
   | review count
   | reviews
   | reviewer attribution
   | Google Maps links
   v
Node / Express
   |
   | JSON
   v
React
   |
   v
Google Reviews Section
```

## 22. Key Requirement

The single most important security rule:

```text
GOOGLE_PLACES_API_KEY
        ↓
Node.js ONLY
        ↓
Never React
Never Vite
Never public GitHub
Never browser JavaScript
```
