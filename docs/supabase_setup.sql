-- =========================================================
-- BAYEDHA (بيّضها) - COMPLETE SUPABASE CLOUD DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wqtwsqyhzplrmmnvoxql/sql
-- =========================================================

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create Enums
DO $$ BEGIN
    CREATE TYPE spot_status_enum AS ENUM ('blackspot', 'campaign', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE volume_level_enum AS ENUM ('light', 'medium', 'heavy');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE access_type_enum AS ENUM ('paved', 'narrow');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create 'spots' table
CREATE TABLE IF NOT EXISTS public.spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status spot_status_enum NOT NULL DEFAULT 'blackspot',
    category VARCHAR(50) NOT NULL DEFAULT 'waste',
    
    title_ar VARCHAR(255) NOT NULL,
    title_fr VARCHAR(255),
    neighbourhood_ar VARCHAR(255) NOT NULL,
    neighbourhood_fr VARCHAR(255),
    description_ar TEXT,
    description_fr TEXT,
    
    volume volume_level_enum NOT NULL DEFAULT 'light',
    materials TEXT[] DEFAULT ARRAY['plastic']::TEXT[],
    accessibility access_type_enum NOT NULL DEFAULT 'paved',
    
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    
    photo_url TEXT,
    before_photo_url TEXT,
    after_photo_url TEXT,
    cleaned_by_ar VARCHAR(255),
    cleaned_by_fr VARCHAR(255),
    
    upvotes_count INTEGER NOT NULL DEFAULT 1,
    campaign_id UUID,
    
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create 'campaigns' table
CREATE TABLE IF NOT EXISTS public.campaigns (
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

-- 5. Enable Row Level Security (RLS) & Public Policies
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read & insert for public civic participation
CREATE POLICY "Allow public read access on spots" ON public.spots FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on spots" ON public.spots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on spots" ON public.spots FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on spots" ON public.spots FOR DELETE USING (true);

CREATE POLICY "Allow public read access on campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on campaigns" ON public.campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on campaigns" ON public.campaigns FOR UPDATE USING (true);

-- 6. Enable Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.spots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;
