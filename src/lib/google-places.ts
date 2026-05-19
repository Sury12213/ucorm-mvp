export type GooglePlaceReview = {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: {
    text?: string;
    languageCode?: string;
  };
  originalText?: {
    text?: string;
    languageCode?: string;
  };
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
  publishTime?: string;
};

export type GooglePlaceDetails = {
  id: string;
  displayName?: {
    text?: string;
    languageCode?: string;
  };
  reviews?: GooglePlaceReview[];
};

export async function fetchPlaceDetails(placeId: string): Promise<GooglePlaceDetails> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GOOGLE_PLACES_API_KEY');
  }

  const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'id,displayName,reviews',
    },
  });

  if (!response.ok) {
    throw new Error(`Google Places request failed: ${response.status}`);
  }

  return response.json();
}
