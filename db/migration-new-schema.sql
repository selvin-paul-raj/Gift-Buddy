-- ==========================================================
-- USERS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birthday DATE,
  upi_id TEXT,  -- ✅ For payment tracking (e.g., user@upi)
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',  -- ✅ Role-based access
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- EVENTS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, -- e.g., "October Birthday Celebration"
  date DATE NOT NULL,
  birthday_person_id UUID REFERENCES users(id) ON DELETE SET NULL, -- whose birthday
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('upcoming', 'completed', 'cancelled')) DEFAULT 'upcoming',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- GIFTS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  gift_name TEXT NOT NULL,  -- e.g., "Smart Watch"
  gift_link TEXT,           -- optional: Amazon / Flipkart link
  total_amount NUMERIC NOT NULL, -- total cost of the gift
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- CONTRIBUTIONS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE,
  split_amount NUMERIC NOT NULL,  -- ✅ individual share
  paid BOOLEAN DEFAULT FALSE,     -- ✅ did user pay?
  payment_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

-- ==========================================================
-- INDEXES
-- ==========================================================
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_contributions_event_id ON contributions(event_id);
CREATE INDEX idx_contributions_user_id ON contributions(user_id);
CREATE INDEX idx_gifts_event_id ON gifts(event_id);

-- ==========================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- POLICIES FOR USERS
-- ==========================================================

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admin can view all users
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- ==========================================================
-- POLICIES FOR EVENTS
-- ==========================================================

-- ✅ Admin can CREATE, UPDATE, and DELETE events
CREATE POLICY "Admin can manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- ✅ Normal users can only VIEW upcoming events
CREATE POLICY "Users can view upcoming events" ON events
  FOR SELECT USING (
    status = 'upcoming'
  );

-- ==========================================================
-- POLICIES FOR GIFTS
-- ==========================================================

-- ✅ Admin can manage gifts
CREATE POLICY "Admin can manage gifts" ON gifts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ✅ Users can view gifts related to upcoming events
CREATE POLICY "Users can view gifts for upcoming events" ON gifts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events WHERE events.id = gifts.event_id AND events.status = 'upcoming'
    )
  );

-- ==========================================================
-- POLICIES FOR CONTRIBUTIONS
-- ==========================================================

-- ✅ Admin can view all contributions
CREATE POLICY "Admin can view all contributions" ON contributions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ✅ Users can view only their own contributions
CREATE POLICY "Users can view own contributions" ON contributions
  FOR SELECT USING (auth.uid() = user_id);

-- ✅ Users can update payment status for their contributions (mark paid/unpaid)
CREATE POLICY "Users can update own payment status" ON contributions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
