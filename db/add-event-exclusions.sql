-- Create event_exclusions table to track which users are excluded from events
-- This prevents excluded users from seeing the event and from being part of the cost split

CREATE TABLE IF NOT EXISTS public.event_exclusions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  excluded_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure no duplicate exclusions for same event+user pair
  UNIQUE(event_id, excluded_user_id)
);

-- Create index for faster queries when checking if user is excluded from event
CREATE INDEX IF NOT EXISTS idx_event_exclusions_event_user 
ON public.event_exclusions(event_id, excluded_user_id);

-- Create index for checking all exclusions for a specific event
CREATE INDEX IF NOT EXISTS idx_event_exclusions_event 
ON public.event_exclusions(event_id);

-- Enable RLS for event_exclusions
ALTER TABLE public.event_exclusions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view exclusions for events they're involved in
CREATE POLICY "Users can view exclusions for their events"
ON public.event_exclusions FOR SELECT
USING (
  event_id IN (
    SELECT id FROM public.events WHERE created_by = auth.uid()
  )
  OR excluded_user_id = auth.uid()
);

-- Policy: Only event creator can insert exclusions
CREATE POLICY "Only event creator can exclude users"
ON public.event_exclusions FOR INSERT
WITH CHECK (
  event_id IN (
    SELECT id FROM public.events WHERE created_by = auth.uid()
  )
);

-- Policy: Only event creator can delete exclusions
CREATE POLICY "Only event creator can remove exclusions"
ON public.event_exclusions FOR DELETE
USING (
  event_id IN (
    SELECT id FROM public.events WHERE created_by = auth.uid()
  )
);

-- Add comments for documentation
COMMENT ON TABLE public.event_exclusions IS 'Tracks which users are excluded from specific events. Excluded users do not see the event in their dashboard and are not part of the cost split calculation.';

COMMENT ON COLUMN public.event_exclusions.event_id IS 'Reference to the event';

COMMENT ON COLUMN public.event_exclusions.excluded_user_id IS 'User ID that is excluded from this event';

COMMENT ON COLUMN public.event_exclusions.created_at IS 'When the exclusion was created';
