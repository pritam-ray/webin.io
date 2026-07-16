-- ============================================
-- Webing CRM - Supabase Database Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Team Members Table
CREATE TABLE IF NOT EXISTS crm_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL DEFAULT '0000',
  role TEXT, -- Keep old column for migration check
  roles TEXT[] NOT NULL DEFAULT '{}'::text[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company TEXT,
  city TEXT,
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'contacted', 'interested', 'converted', 'in-review', 'closed-won', 'closed-lost')),
  assigned_to UUID REFERENCES crm_users(id) ON DELETE SET NULL,
  forwarded_to UUID REFERENCES crm_users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES crm_users(id) ON DELETE SET NULL,
  package TEXT,
  requirements TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Activity Log Table
CREATE TABLE IF NOT EXISTS crm_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES crm_users(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Spreadsheets Table
CREATE TABLE IF NOT EXISTS crm_sheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  rows JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES crm_users(id) ON DELETE SET NULL,
  shared_with UUID[] NOT NULL DEFAULT '{}'::uuid[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON crm_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_forwarded_to ON crm_leads(forwarded_to);
CREATE INDEX IF NOT EXISTS idx_activity_lead_id ON crm_activity_log(lead_id);

-- 6. Auto-update updated_at on leads
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_leads_updated_at ON crm_leads;
CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_sheets_updated_at ON crm_sheets;
CREATE TRIGGER trigger_sheets_updated_at
  BEFORE UPDATE ON crm_sheets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 7. Migrate crm_users role column to roles array if role exists
ALTER TABLE crm_users DROP CONSTRAINT IF EXISTS crm_users_role_check;
DO $$ 
BEGIN 
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name='crm_users' AND column_name='role'
  ) THEN
    -- If roles array column exists, copy data, drop role
    IF EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name='crm_users' AND column_name='roles'
    ) THEN
      UPDATE crm_users SET roles = ARRAY[role] WHERE roles = '{}'::text[] AND role IS NOT NULL;
      ALTER TABLE crm_users DROP COLUMN IF EXISTS role;
    ELSE
      ALTER TABLE crm_users RENAME COLUMN role TO roles;
      ALTER TABLE crm_users ALTER COLUMN roles TYPE TEXT[] USING ARRAY[roles];
      ALTER TABLE crm_users ALTER COLUMN roles SET DEFAULT '{}'::text[];
    END IF;
  END IF;
END $$;

-- 8. Insert or update default admin user with all roles
INSERT INTO crm_users (name, email, pin, roles)
VALUES ('Pritam', 'impritamray@gmail.com', 'asdfghjkl;''', ARRAY['admin', 'lead-assigner', 'sales', 'technical'])
ON CONFLICT (email) DO UPDATE 
SET roles = EXCLUDED.roles, pin = EXCLUDED.pin;

-- 9. Add shared_with column to sheets table if not exists
ALTER TABLE crm_sheets ADD COLUMN IF NOT EXISTS shared_with UUID[] NOT NULL DEFAULT '{}'::uuid[];

-- 10. Row Level Security Policies
ALTER TABLE crm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_sheets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for crm_users" ON crm_users;
CREATE POLICY "Allow all for crm_users" ON crm_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for crm_leads" ON crm_leads;
CREATE POLICY "Allow all for crm_leads" ON crm_leads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for crm_activity_log" ON crm_activity_log;
CREATE POLICY "Allow all for crm_activity_log" ON crm_activity_log FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for crm_sheets" ON crm_sheets;
CREATE POLICY "Allow all for crm_sheets" ON crm_sheets FOR ALL USING (true) WITH CHECK (true);
