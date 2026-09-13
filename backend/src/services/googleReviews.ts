import { env } from "../config/env";

// Live rating + reviews for the clinic's Google Business Profile, via the
// Places API (New). Google returns at most 5 reviews ("most relevant").
//
// Reviews are kept in memory only, never written to the database: Google's
// terms restrict storing Places content, and a short in-process cache is enough
// to keep the per-request API cost down. (Place IDs themselves may be stored.)

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

const PLACES = "https://places.googleapis.com/v1";
const FIELD_MASK = "id,displayName,rating,userRatingCount,googleMapsUri,reviews";
const RETRY_AFTER_FAILURE_MS = 5 * 60 * 1000;

let cached: { payload: GoogleReviewsPayload; expiresAt: number } | null = null;
let inflight: Promise<GoogleReviewsPayload> | null = null;
let resolvedPlaceId: string | null = null;
let failure: { error: Error; until: number } | null = null;

export function isGoogleReviewsConfigured(): boolean {
  const { apiKey, placeId, placeCid, placeQuery } = env.googleReviews;
  return Boolean(apiKey && (placeId || (placeCid && placeQuery)));
}

async function placesRequest<T>(path: string, init: RequestInit & { fieldMask: string }): Promise<T> {
  const { fieldMask, headers, ...rest } = init;
  const res = await fetch(`${PLACES}${path}`, {
    ...rest,
    headers: {
      "X-Goog-Api-Key": env.googleReviews.apiKey,
      "X-Goog-FieldMask": fieldMask,
      ...(headers as Record<string, string> | undefined),
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    // Google's error body names the problem (bad key, API not enabled, billing
    // off) without echoing the key, so it's safe to log.
    const body = await res.text().catch(() => "");
    throw new Error(`Places API ${res.status}: ${body.replace(/\s+/g, " ").slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/**
 * The configured Place ID, or — when only the listing's CID is known (the number
 * in a Google Maps share link) — the ID found by searching for the listing and
 * keeping only the result with that exact CID, so a similarly named business can
 * never be picked up by mistake.
 */
async function getPlaceId(): Promise<string> {
  const { placeId, placeCid, placeQuery } = env.googleReviews;
  if (placeId) return placeId;
  if (resolvedPlaceId) return resolvedPlaceId;

  const found = await placesRequest<{ places?: { id: string; googleMapsUri?: string }[] }>(
    "/places:searchText",
    {
      method: "POST",
      fieldMask: "places.id,places.googleMapsUri",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ textQuery: placeQuery, regionCode: "IN" }),
    }
  );
  const match = (found.places ?? []).find((p) => (p.googleMapsUri ?? "").includes(`cid=${placeCid}`));
  if (!match) {
    throw new Error(`No search result for "${placeQuery}" has CID ${placeCid}`);
  }
  console.log(`[GoogleReviews] Resolved listing CID ${placeCid} -> place ID ${match.id}`);
  resolvedPlaceId = match.id;
  return match.id;
}

async function fetchFromGoogle(): Promise<GoogleReviewsPayload> {
  const placeId = await getPlaceId();
  const place = await placesRequest<PlacesDetails>(
    `/places/${encodeURIComponent(placeId)}?languageCode=en`,
    { fieldMask: FIELD_MASK }
  );

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
  if (!isGoogleReviewsConfigured()) return { configured: false };

  if (cached && cached.expiresAt > Date.now()) return cached.payload;
  // After a failure with nothing cached (e.g. billing not active yet), don't
  // call Google on every page view — wait a few minutes before trying again.
  if (!cached && failure && failure.until > Date.now()) throw failure.error;
  // Collapse concurrent cache misses into a single upstream call.
  if (inflight) return inflight;

  inflight = fetchFromGoogle()
    .then((payload) => {
      cached = { payload, expiresAt: Date.now() + env.googleReviews.cacheSeconds * 1000 };
      failure = null;
      return payload;
    })
    .catch((err: unknown) => {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("[GoogleReviews]", error.message);
      // A Google outage shouldn't blank the section: serve the last good copy
      // for a short while, and retry soon rather than hammering the API.
      if (cached) {
        cached.expiresAt = Date.now() + RETRY_AFTER_FAILURE_MS;
        return cached.payload;
      }
      failure = { error, until: Date.now() + RETRY_AFTER_FAILURE_MS };
      throw error;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}
