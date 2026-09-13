import { env } from "../config/env";

// Live rating + reviews for the clinic's Google Business Profile, via the
// Places API (New). Google returns at most 5 reviews ("most relevant").
//
// Reviews are kept in memory only, never written to the database: Google's
// terms restrict storing Places content, and a short in-process cache is enough
// to keep the per-request API cost down.

export interface PublicGoogleReview {
  authorName: string;
  authorUri: string | null;
  authorPhotoUri: string | null;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string | null;
  reviewUri: string | null;
}

export type GoogleReviewsPayload =
  | { configured: false }
  | {
      configured: true;
      placeName: string | null;
      rating: number | null;
      userRatingCount: number;
      googleMapsUri: string | null;
      writeReviewUri: string;
      reviews: PublicGoogleReview[];
      fetchedAt: string;
    };

interface PlacesReview {
  rating?: number;
  relativePublishTimeDescription?: string;
  publishTime?: string;
  googleMapsUri?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
}

interface PlacesDetails {
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
}

const FIELD_MASK = "id,displayName,rating,userRatingCount,googleMapsUri,reviews";

let cached: { payload: GoogleReviewsPayload; expiresAt: number } | null = null;
let inflight: Promise<GoogleReviewsPayload> | null = null;

async function fetchFromGoogle(): Promise<GoogleReviewsPayload> {
  const { apiKey, placeId } = env.googleReviews;
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`,
    {
      headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": FIELD_MASK },
      signal: AbortSignal.timeout(8000),
    }
  );
  if (!res.ok) {
    // Google's error body names the problem (bad key, API not enabled, billing
    // off) without echoing the key, so it's safe to log.
    const body = await res.text().catch(() => "");
    throw new Error(`Places API ${res.status}: ${body.slice(0, 300)}`);
  }
  const place = (await res.json()) as PlacesDetails;

  return {
    configured: true,
    placeName: place.displayName?.text ?? null,
    rating: typeof place.rating === "number" ? place.rating : null,
    userRatingCount: place.userRatingCount ?? 0,
    googleMapsUri: place.googleMapsUri ?? null,
    writeReviewUri: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`,
    reviews: (place.reviews ?? [])
      .map((r) => ({
        authorName: r.authorAttribution?.displayName ?? "Google user",
        authorUri: r.authorAttribution?.uri ?? null,
        authorPhotoUri: r.authorAttribution?.photoUri ?? null,
        rating: r.rating ?? 0,
        // Shown as written — Google's attribution rules don't allow editing reviews.
        text: r.text?.text ?? r.originalText?.text ?? "",
        relativeTime: r.relativePublishTimeDescription ?? "",
        publishTime: r.publishTime ?? null,
        reviewUri: r.googleMapsUri ?? null,
      }))
      .filter((r) => r.text.trim().length > 0),
    fetchedAt: new Date().toISOString(),
  };
}

export async function getGoogleReviews(): Promise<GoogleReviewsPayload> {
  const { apiKey, placeId, cacheSeconds } = env.googleReviews;
  if (!apiKey || !placeId) return { configured: false };

  if (cached && cached.expiresAt > Date.now()) return cached.payload;
  // Collapse concurrent cache misses into a single upstream call.
  if (inflight) return inflight;

  inflight = fetchFromGoogle()
    .then((payload) => {
      cached = { payload, expiresAt: Date.now() + cacheSeconds * 1000 };
      return payload;
    })
    .catch((err) => {
      console.error("[GoogleReviews]", err instanceof Error ? err.message : err);
      // A Google outage shouldn't blank the section: serve the last good copy
      // for a short while, and retry soon rather than hammering the API.
      if (cached) {
        cached.expiresAt = Date.now() + 5 * 60 * 1000;
        return cached.payload;
      }
      throw err;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}
