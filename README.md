# UCORM MVP

UCORM MVP là dashboard quản trị đánh giá khách sạn dùng AI. Ứng dụng lấy đánh giá từ Google Places, lưu dữ liệu vào Supabase, tạo 3 gợi ý phản hồi bằng AI và cho phép duyệt phản hồi để chuyển trạng thái đánh giá từ `Pending` sang `Resolved`.

## Tính năng chính

- Đăng nhập quản trị bằng tài khoản nội bộ.
- Lấy 5 đánh giá mới nhất từ Google Places theo Place ID.
- Lưu địa điểm, đánh giá và gợi ý phản hồi vào Supabase.
- Tạo 3 phong cách phản hồi: `Standard`, `Friendly`, `Recovery`.
- Chỉnh sửa nội dung phản hồi trước khi duyệt.
- Theo dõi trạng thái đánh giá: `Pending` và `Resolved`.
- Seed dữ liệu mẫu khi Google Places bị giới hạn quota hoặc billing.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Framework | Next.js 14 App Router |
| UI | React, Tailwind CSS |
| Database | Supabase PostgreSQL |
| Review source | Google Places API v1 |
| AI provider | OpenRouter |
| AI model | `google/gemini-2.0-flash-001` |
| Deploy | Vercel |

## Yêu cầu hệ thống

- Node.js 20+
- npm
- Supabase project
- Google Places API key
- OpenRouter API key

## Cài đặt local

### 1. Cài dependencies

```bash
npm install
```

### 2. Tạo file môi trường

Tạo file `.env.local` tại thư mục gốc:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUTH_SECRET=at-least-32-random-characters
GOOGLE_PLACES_API_KEY=your-google-places-key
OPENROUTER_API_KEY=your-openrouter-key
```

> Không commit `.env.local`, service role key hoặc bất kỳ secret nào lên Git.

### 3. Tạo database schema

Chạy SQL sau trong Supabase SQL Editor:

```sql
CREATE TABLE places (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id    TEXT UNIQUE NOT NULL,
  name        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id         TEXT NOT NULL REFERENCES places(place_id),
  google_review_id TEXT UNIQUE,
  author_name      TEXT,
  rating           INT CHECK (rating BETWEEN 1 AND 5),
  text             TEXT,
  review_time      TIMESTAMPTZ,
  status           TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Resolved')),
  approved_reply   TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_suggestions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  tone        TEXT NOT NULL CHECK (tone IN ('Standard', 'Friendly', 'Recovery')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admins (username, password_hash)
VALUES ('admin', '$2b$12$zVMq/2fPQVUdG7ExkFOzLuN6XWU8gSaFgib4I/xYbcUdcSM5rKjMK')
ON CONFLICT (username) DO NOTHING;
```

### 4. Chạy development server

```bash
npm run dev
```

Mở `http://localhost:3000`, đăng nhập bằng tài khoản admin mặc định:

| Trường | Giá trị |
| --- | --- |
| Username | `admin` |
| Password | `admin123` |

## Quy trình sử dụng

1. Nhập Google Place ID.
2. Bấm `Lấy đánh giá` để tải đánh giá mới nhất.
3. Chọn đánh giá cần phản hồi.
4. Bấm `Tạo phản hồi AI` để sinh 3 gợi ý.
5. Chỉnh sửa gợi ý nếu cần.
6. Bấm `Duyệt phản hồi này`.
7. Kiểm tra trạng thái chuyển từ `Pending` sang `Resolved`.

## Seed dữ liệu mẫu

Dùng khi Google Places API chưa bật billing, hết quota hoặc chưa có Place ID hợp lệ:

```bash
npm run seed
```

Sau khi seed xong, reload dashboard để xem dữ liệu mẫu.

## Scripts

| Lệnh | Mục đích |
| --- | --- |
| `npm run dev` | Chạy ứng dụng ở môi trường local |
| `npm run build` | Build production |
| `npm run start` | Chạy production server sau khi build |
| `npm run lint` | Kiểm tra lint |
| `npm run seed` | Thêm dữ liệu đánh giá mẫu |

## API endpoints

| Endpoint | Method | Mô tả |
| --- | --- | --- |
| `/api/auth/login` | `POST` | Đăng nhập quản trị |
| `/api/auth/logout` | `POST` | Đăng xuất |
| `/api/reviews` | `GET` | Lấy danh sách đánh giá kèm gợi ý AI |
| `/api/reviews/fetch` | `POST` | Lấy đánh giá từ Google Places và lưu vào database |
| `/api/reviews/[id]/generate` | `POST` | Sinh 3 gợi ý phản hồi AI cho một đánh giá |
| `/api/reviews/[id]/approve` | `PATCH` | Duyệt phản hồi đã chọn và cập nhật trạng thái |

