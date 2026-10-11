import "server-only";

/**
 * Places API (New) client. Server-only: the API key never reaches the
 * browser. Both functions degrade to an empty/null result (not a throw)
 * when GOOGLE_PLACES_API_KEY is unset, so the rest of the pipeline keeps
 * working without a key in local dev.
 * Decision record: docs/01-architecture/decisions/0009.
 */

const PLACES_API_BASE = "https://places.googleapis.com/v1";

export type PlaceSuggestion = {
  placeId: string;
  text: string;
};

export type PlaceDetails = {
  placeId: string;
  displayName: string | null;
  formattedAddress: string | null;
  rating: number | null;
  userRatingCount: number | null;
  googleMapsUri: string | null;
};

function apiKey(): string | null {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  return key && key.trim() !== "" ? key : null;
}

/** False until GOOGLE_PLACES_API_KEY is set; the UI then says "opens soon"
 * instead of offering a search that can never return anything. */
export function isPlacesConfigured(): boolean {
  return apiKey() !== null;
}

export async function autocompletePlaces(
  input: string,
  sessionToken: string
): Promise<PlaceSuggestion[]> {
  const key = apiKey();
  if (!key) return [];

  try {
    const res = await fetch(`${PLACES_API_BASE}/places:autocomplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
      },
      body: JSON.stringify({ input, sessionToken }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];

    const data = await res.json();
    const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
    return suggestions
      .map((s: { placePrediction?: { placeId?: string; text?: { text?: string } } }) => {
        const prediction = s.placePrediction;
        if (!prediction?.placeId || !prediction.text?.text) return null;
        return { placeId: prediction.placeId, text: prediction.text.text };
      })
      .filter((s: PlaceSuggestion | null): s is PlaceSuggestion => s !== null);
  } catch {
    return [];
  }
}

export async function getPlaceDetails(
  placeId: string,
  sessionToken?: string
): Promise<PlaceDetails | null> {
  const key = apiKey();
  if (!key) return null;

  try {
    const url = new URL(`${PLACES_API_BASE}/places/${encodeURIComponent(placeId)}`);
    if (sessionToken) url.searchParams.set("sessionToken", sessionToken);

    const res = await fetch(url.toString(), {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "id,displayName,formattedAddress,rating,userRatingCount,googleMapsUri",
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    return {
      placeId: data.id ?? placeId,
      displayName: data.displayName?.text ?? null,
      formattedAddress: data.formattedAddress ?? null,
      rating: typeof data.rating === "number" ? data.rating : null,
      userRatingCount: typeof data.userRatingCount === "number" ? data.userRatingCount : null,
      googleMapsUri: data.googleMapsUri ?? null,
    };
  } catch {
    return null;
  }
}
