CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT NOT NULL REFERENCES places(place_id),
  google_review_id TEXT,
  author_name TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  review_time TIMESTAMPTZ,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Resolved')),
  approved_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  tone TEXT NOT NULL CHECK (tone IN ('Standard', 'Friendly', 'Recovery')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX reviews_place_id_idx ON reviews(place_id);
CREATE INDEX ai_suggestions_review_id_idx ON ai_suggestions(review_id);
