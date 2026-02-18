-- Create prospects table for storing customer leads (customers of Buzzly users)
CREATE TABLE IF NOT EXISTS public.prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  position TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'cold' CHECK (status IN ('hot', 'warm', 'cold')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  phone TEXT,
  notes TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own prospects
CREATE POLICY "Users can view their own prospects"
ON public.prospects
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prospects"
ON public.prospects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prospects"
ON public.prospects
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prospects"
ON public.prospects
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_prospects_updated_at
BEFORE UPDATE ON public.prospects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_prospects_user_id ON public.prospects(user_id);
CREATE INDEX idx_prospects_status ON public.prospects(status);
CREATE INDEX idx_prospects_score ON public.prospects(score DESC);