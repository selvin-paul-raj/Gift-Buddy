-- Add phone column to users table if it doesn't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone text null;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_phone on public.users (phone);

-- Add comment
COMMENT ON COLUMN public.users.phone IS 'User phone number for payment contact';
