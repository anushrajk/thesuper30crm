-- Agency OS Supabase Schema

-- PROFILES: Unified table for Team Members and Client Contacts
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT, -- Initials or Emoji
    color TEXT, -- UI Color
    role_type TEXT DEFAULT 'editor', -- super_admin, admin, editor, client
    reports_to UUID REFERENCES profiles(id),
    client_id TEXT, -- If role_type is 'client', links to clients table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CLIENTS: Active and Pipeline Accounts
CREATE TABLE clients (
    id TEXT PRIMARY KEY DEFAULT 'c' || floor(random() * 1000000)::text,
    name TEXT NOT NULL,
    industry TEXT,
    source TEXT,
    owner_id UUID REFERENCES profiles(id),
    stage TEXT DEFAULT 'inquiry', -- inquiry, requirements, proposal, closing, closed
    health TEXT DEFAULT 'On Track', -- On Track, At Risk, Off Track
    value TEXT, -- Monthly Value
    services TEXT[], -- Array of signed-up services
    portal_email TEXT,
    portal_password TEXT,
    onboarding_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TASKS: Master Task List
CREATE TABLE tasks (
    id TEXT PRIMARY KEY DEFAULT 't' || floor(random() * 1000000)::text,
    title TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'todo', -- todo, in-progress, done, waiting-on-client
    priority TEXT DEFAULT 'medium', -- low, medium, high, critical
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES profiles(id),
    due_date DATE,
    completion_date DATE,
    service TEXT, -- seo, smo, content, etc.
    checklist JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- REQUESTS: Client Portal Requests
CREATE TABLE requests (
    id TEXT PRIMARY KEY DEFAULT 'r' || floor(random() * 1000000)::text,
    title TEXT NOT NULL,
    details TEXT,
    type TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CAMPAIGNS: Marketing/SEO Campaigns
CREATE TABLE campaigns (
    id TEXT PRIMARY KEY DEFAULT 'cmp' || floor(random() * 1000000)::text,
    name TEXT NOT NULL,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Planning', -- Planning, Active, Completed, Paused
    budget TEXT,
    spend TEXT,
    progress INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;

-- AUTO-CREATE PROFILE ON SIGNUP
-- This function will run whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar, role_type)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar', '👤'),
    COALESCE(new.raw_user_meta_data->>'role_type', 'editor')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
