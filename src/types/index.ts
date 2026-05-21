export type ReviewStatus = 'Pending' | 'Resolved';
export type SuggestionTone = 'Standard' | 'Friendly' | 'Recovery';

export type Place = {
  id: string;
  place_id: string;
  name: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  place_id: string;
  google_review_id: string | null;
  author_name: string | null;
  rating: number | null;
  text: string | null;
  review_time: string | null;
  status: ReviewStatus;
  approved_reply: string | null;
  created_at: string;
  ai_suggestions?: AISuggestion[];
  places?: Pick<Place, 'name' | 'place_id'> | null;
};

export type AISuggestion = {
  id: string;
  review_id: string;
  tone: SuggestionTone;
  content: string;
  created_at: string;
};
