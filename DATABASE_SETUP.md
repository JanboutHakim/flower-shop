# Database Setup Guide - Flower Shop

## 1. Choose Your Database Solution

### Option A: Supabase (RECOMMENDED) ⭐
- PostgreSQL with built-in JavaScript client
- Free tier: 500MB storage, 50k MAU
- Row Level Security (RLS) for security
- Real-time subscriptions available

**Setup:**
1. Go to https://supabase.com
2. Create new project (select region closest to you)
3. Copy your Project URL and anon key from Settings > API

### Option B: Neon + Serverless Driver
- Direct Neon connection from frontend
- Requires more security considerations
- Good if you already have Neon account

---

## 2. Database Schema (Copy to Supabase SQL Editor)

```sql
-- PRODUCTS TABLE
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  icon TEXT,
  count INTEGER DEFAULT 0,
  description_en TEXT,
  description_ar TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- THEMES TABLE
CREATE TABLE themes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  colors JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ORDERS TABLE
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time TEXT NOT NULL,
  notes TEXT,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, delivered, cancelled
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CUSTOMIZE TABLE (for customizations like ribbon, wrap, cards)
CREATE TABLE customizations (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id),
  product_id BIGINT REFERENCES products(id),
  ribbon TEXT,
  wrap TEXT,
  card_message TEXT,
  quantity INTEGER,
  subtotal DECIMAL(10, 2)
);

-- Enable RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public read on products and themes
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);
CREATE POLICY "themes_public_read" ON themes FOR SELECT USING (true);

-- Policies: Allow insert on orders (public can create)
CREATE POLICY "orders_public_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_public_read" ON orders FOR SELECT USING (true);

CREATE POLICY "customizations_public_insert" ON customizations FOR INSERT WITH CHECK (true);
CREATE POLICY "customizations_public_read" ON customizations FOR SELECT USING (true);

-- INDEXES for performance
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_phone ON orders(customer_phone);
CREATE INDEX idx_products_category ON products(category);
```

---

## 3. Insert Initial Data

```sql
-- Insert products
INSERT INTO products (name_en, name_ar, category, price, icon, count, description_en, description_ar) VALUES
('Eternal Red Roses', 'ورد أحمر أبدي', 'romantic', 65, '🌹', 24, '24 premium red roses wrapped in black with a gold ribbon — the ultimate declaration of love.', '24 وردة حمراء فاخرة ملفوفة باللون الأسود مع شريط ذهبي — الإعلان الأسمى عن الحب.'),
('Graduation Pride', 'فخر التخرج', 'graduation', 75, '🌻', 30, 'Golden sunflowers and white lilies celebrating your greatest achievement.', 'عباد الشمس الذهبي والزنبق الأبيض يحتفل بأعظم إنجازاتك.'),
('Healing Garden', 'حديقة الشفاء', 'getWell', 45, '🌷', 15, 'Soft pink tulips and lilies to bring warmth and hope to any recovery.', 'زنبق وليلي وردي ناعم لإضفاء الدفء والأمل على أي تعافٍ.'),
('Birthday Bliss', 'سعادة عيد الميلاد', 'birthday', 55, '🌸', 20, 'A joyful burst of mixed colorful blooms for the most festive celebrations.', 'انفجار من الأزهار الملونة المختلطة للاحتفالات الأكثر بهجة.'),
('Bridal Grace', 'رونق العروس', 'wedding', 120, '🤍', 50, 'Cascading white peonies and garden roses — timeless bridal elegance.', 'فاوانيا بيضاء وورد حديقة منسدل — أناقة العروس الخالدة.'),
('Peaceful Sympathy', 'تعازي هادئة', 'sympathy', 50, '🕊️', 18, 'White chrysanthemums and cream roses for quiet, peaceful moments.', 'أقحوان أبيض وورد كريمي للحظات الهادئة والسلام.'),
('Pink Romance', 'الرومانسية الوردية', 'romantic', 60, '🌺', 20, 'Pink peonies and spray roses wrapped in blush silk — pure romance.', 'فاوانيا وردية وورد سبراي ملفوف بالحرير — رومانسية خالصة.'),
('Scholar''s Triumph', 'انتصار العالم', 'graduation', 85, '🌼', 35, 'Bright yellow and white blooms crowned with golden sunflowers.', 'أزهار صفراء وبيضاء متوجة بعباد الشمس الذهبي.');
```

---

## 4. Cloudinary Setup

1. Go to https://cloudinary.com (free tier: 25GB)
2. Create account and get your **Cloud Name**
3. Generate unsigned upload preset:
   - Go to Settings > Upload
   - Create upload preset with name: `flower_shop`
   - Set to "Unsigned"

---

## 5. Environment Variables

Create `.env.local` in your project root:

```env
# Supabase
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=flower_shop

# WhatsApp
REACT_APP_WHATSAPP_NUMBER=963965578857
```

