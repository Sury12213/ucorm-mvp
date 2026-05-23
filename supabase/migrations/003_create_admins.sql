CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admins (username, password_hash)
VALUES ('admin', '$2b$12$zVMq/2fPQVUdG7ExkFOzLuN6XWU8gSaFgib4I/xYbcUdcSM5rKjMK')
ON CONFLICT (username) DO NOTHING;
