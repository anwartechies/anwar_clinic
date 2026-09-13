import { API_URL } from "@/config/constants";

export interface GoogleReviewItem {
  authorName: string;
  authorUri: string | null;
  authorPhotoUri: string | null;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string | null;
  reviewUri: string | null;
}

export interface GoogleReviewsData {
  placeName: string | null;
  rating: number | null;
  userRatingCount: number;
  googleMapsUri: string | null;
  writeReviewUri: string;
  reviews: GoogleReviewItem[];
}

/**
 * Live Google rating + reviews, proxied by the backend (which holds the API key
 * and caches). Resolves to null whenever there's nothing real to show — not
 * configured yet, Google unavailable, or no reviews — so callers can simply
 * hide the section instead of rendering placeholder content.
 */
export async function fetchGoogleReviews(signal?: AbortSignal): Promise<GoogleReviewsData | null> {
  try {
    const res = await fetch(`${API_URL}/public/google-reviews`, { signal });
    if (!res.ok) return null;
    const body = await res.json();
    if (!body?.configured || !Array.isArray(body.reviews) || body.reviews.length === 0) return null;
    return body as GoogleReviewsData;
  } catch {
    return null;
  }
}
