-- Fix politicians schema: convert bigint to UUID for consistency

-- Drop dependent tables (preserve data if possible by backing up first)
DROP TABLE IF EXISTS public.politician_committees CASCADE;
DROP TABLE IF EXISTS public.politician_factions CASCADE;
DROP TABLE IF EXISTS public.politicians CASCADE;

-- Recreate politicians table with UUID
CREATE TABLE public.politicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_kana TEXT NOT NULL,
    avatar_url TEXT,
    terms_count INTEGER DEFAULT 1,
    faction_id UUID REFERENCES public.factions(id) ON DELETE SET NULL,
    committee_names TEXT[] DEFAULT '{}',
    website_url TEXT,
    twitter_url TEXT,
    contact_info TEXT,
    bio TEXT,
    profile_source_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    data_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recreate politician_factions with UUID references
CREATE TABLE public.politician_factions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
    faction_id UUID NOT NULL REFERENCES public.factions(id) ON DELETE RESTRICT,
    started_on DATE,
    ended_on DATE,
    source_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (ended_on IS NULL OR started_on IS NULL OR ended_on >= started_on)
);

-- Recreate politician_committees with UUID references
CREATE TABLE public.politician_committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
    committee_id UUID NOT NULL REFERENCES public.committees(id) ON DELETE RESTRICT,
    started_on DATE,
    ended_on DATE,
    source_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (ended_on IS NULL OR started_on IS NULL OR ended_on >= started_on),
    UNIQUE (politician_id, committee_id, started_on)
);

-- Enable RLS
ALTER TABLE public.politicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politician_factions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politician_committees ENABLE ROW LEVEL SECURITY;

-- Create indices
CREATE UNIQUE INDEX politician_factions_one_current
    ON public.politician_factions (politician_id)
    WHERE ended_on IS NULL;

CREATE INDEX politician_factions_faction_id_idx
    ON public.politician_factions (faction_id);

CREATE INDEX politician_committees_committee_id_idx
    ON public.politician_committees (committee_id);

-- Add columns to related tables
ALTER TABLE public.bill_discussions
    ADD COLUMN IF NOT EXISTS politician_id UUID
        REFERENCES public.politicians(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS source_url TEXT;

CREATE INDEX IF NOT EXISTS bill_discussions_politician_id_idx
    ON public.bill_discussions (politician_id);

ALTER TABLE public.general_questions
    ADD COLUMN IF NOT EXISTS politician_id UUID
        REFERENCES public.politicians(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS general_questions_politician_id_idx
    ON public.general_questions (politician_id);
