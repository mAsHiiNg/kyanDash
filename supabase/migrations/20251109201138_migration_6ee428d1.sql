-- إنشاء جدول الاجتماعات (meetings)
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_type TEXT NOT NULL CHECK (meeting_type IN ('in_person', 'online', 'phone')),
  purpose TEXT NOT NULL,
  summary TEXT,
  attachments TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all meetings" ON meetings FOR SELECT USING (true);
CREATE POLICY "Users can insert meetings" ON meetings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update meetings" ON meetings FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete meetings" ON meetings FOR DELETE USING (auth.uid() IS NOT NULL);

-- إنشاء جدول العروض (quotations)
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  quotation_no TEXT UNIQUE NOT NULL,
  send_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'SAR',
  services TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'rejected')),
  reason TEXT,
  validity_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all quotations" ON quotations FOR SELECT USING (true);
CREATE POLICY "Users can insert quotations" ON quotations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update quotations" ON quotations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete quotations" ON quotations FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create indexes
CREATE INDEX idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX idx_quotations_status ON quotations(status);