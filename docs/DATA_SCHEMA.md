# 🗄️ مخطط قاعدة البيانات (Data Schema & Architecture)

هذا المخطط مهيأ بالكامل للنشر المباشر على **قاعدة بيانات Supabase (PostgreSQL + PostGIS)** ضمن الخطة المجانية (Free Tier).

---

## 1. جدول النقاط السوداء والمواقع (`spots`)

```sql
-- تفعيل إضافة PostGIS للعمليات الجغرافية المكانية
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE spot_status_enum AS ENUM ('blackspot', 'campaign', 'resolved');
CREATE TYPE volume_level_enum AS ENUM ('light', 'medium', 'heavy');
CREATE TYPE access_type_enum AS ENUM ('paved', 'narrow');

CREATE TABLE public.spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status spot_status_enum NOT NULL DEFAULT 'blackspot',
    category VARCHAR(50) NOT NULL DEFAULT 'waste',
    
    -- النصوص باللغتين
    title_ar VARCHAR(255) NOT NULL,
    title_fr VARCHAR(255),
    neighbourhood_ar VARCHAR(255) NOT NULL,
    neighbourhood_fr VARCHAR(255),
    description_ar TEXT,
    description_fr TEXT,
    
    -- البيانات اللوجستية المهيكلة
    volume volume_level_enum NOT NULL DEFAULT 'light',
    materials TEXT[] DEFAULT ARRAY['plastic']::TEXT[],
    accessibility access_type_enum NOT NULL DEFAULT 'paved',
    
    -- الإحداثيات الجغرافية
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    
    -- الروابط والصور
    photo_url TEXT,
    before_photo_url TEXT,
    after_photo_url TEXT,
    cleaned_by_ar VARCHAR(255),
    cleaned_by_fr VARCHAR(255),
    
    -- عداد التأكيدات والمجتمع
    upvotes_count INTEGER NOT NULL DEFAULT 1,
    campaign_id UUID,
    
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- إنشاء فهرس مكاني فائق السرعة لحساب المسافات
CREATE INDEX idx_spots_geom ON public.spots USING GIST (geom);

-- دالة لتحديث النقطة المكانية تلقائياً من خط الطول والعرض
CREATE OR REPLACE FUNCTION update_spot_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_spot_geom
BEFORE INSERT OR UPDATE ON public.spots
FOR EACH ROW EXECUTE FUNCTION update_spot_geom();
```

---

## 2. دالة كشف النقاط القريبة (Server-side Proximity Check)

```sql
-- دالة تعيد النقاط القريبة في نطاق أمتار محددة
CREATE OR REPLACE FUNCTION get_nearby_spots(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION DEFAULT 85.0
)
RETURNS TABLE (
    id UUID,
    title_ar VARCHAR,
    neighbourhood_ar VARCHAR,
    distance_meters DOUBLE PRECISION,
    upvotes_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title_ar,
        s.neighbourhood_ar,
        ST_Distance(
            s.geom::geography, 
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) AS distance_meters,
        s.upvotes_count
    FROM public.spots s
    WHERE s.status IN ('blackspot', 'campaign')
      AND ST_DWithin(
            s.geom::geography, 
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, 
            radius_meters
          )
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;
```

---

## 3. جدول المبادرات التطوعية (`campaigns`)

```sql
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar VARCHAR(255) NOT NULL,
    title_fr VARCHAR(255),
    activity_type VARCHAR(50) NOT NULL DEFAULT 'clean',
    
    event_date VARCHAR(255) NOT NULL,
    event_timestamp TIMESTAMPTZ,
    
    meeting_point_ar VARCHAR(255) NOT NULL,
    meeting_point_fr VARCHAR(255),
    organizer_ar VARCHAR(255) NOT NULL,
    organizer_fr VARCHAR(255),
    target_ar TEXT,
    target_fr TEXT,
    
    tools_needed_ar TEXT[] DEFAULT ARRAY['قفازات', 'أكياس قمامة']::TEXT[],
    tools_needed_fr TEXT[] DEFAULT ARRAY['Gants', 'Sacs poubelle']::TEXT[],
    
    volunteers_registered INTEGER NOT NULL DEFAULT 1,
    banner_url TEXT,
    
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. جدول التأكيدات والتصويت التشاركي (`spot_upvotes`)

```sql
CREATE TABLE public.spot_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_id UUID REFERENCES public.spots(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(spot_id, device_fingerprint)
);
```
