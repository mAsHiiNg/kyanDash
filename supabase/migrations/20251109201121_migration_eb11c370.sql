-- إنشاء جدول المستخدمين (users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'sales')),
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Only admins can insert users" ON users FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Only admins can update users" ON users FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Only admins can delete users" ON users FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- إنشاء جدول العملاء (customers)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT NOT NULL CHECK (source IN ('instagram', 'whatsapp', 'referral', 'website', 'ad', 'other')),
  city TEXT,
  business_type TEXT,
  status TEXT NOT NULL DEFAULT 'new_contact' CHECK (status IN ('new_contact', 'appointment_set', 'quotation_sent', 'follow_up', 'active_client', 'inactive')),
  notes TEXT,
  assigned_to UUID REFERENCES users(id),
  reason_closed TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies for customers table
CREATE POLICY "Users can view all customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Users can insert customers" ON customers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update customers" ON customers FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Only admins can delete customers" ON customers FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create indexes for better performance
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_assigned_to ON customers(assigned_to);
CREATE INDEX idx_customers_created_at ON customers(created_at DESC);