-- إنشاء جدول المتابعات (followups)
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  followup_date TIMESTAMP WITH TIME ZONE NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('call', 'whatsapp', 'email', 'meeting')),
  notes TEXT NOT NULL,
  next_followup TIMESTAMP WITH TIME ZONE,
  is_done BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all followups" ON followups FOR SELECT USING (true);
CREATE POLICY "Users can insert followups" ON followups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update followups" ON followups FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete followups" ON followups FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create indexes
CREATE INDEX idx_followups_customer_id ON followups(customer_id);
CREATE INDEX idx_followups_date ON followups(followup_date);
CREATE INDEX idx_followups_is_done ON followups(is_done);

-- إنشاء جدول الخدمات (services)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all services" ON services FOR SELECT USING (true);
CREATE POLICY "Only admins can insert services" ON services FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Only admins can update services" ON services FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Only admins can delete services" ON services FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- إدراج بعض الخدمات الافتراضية
INSERT INTO services (name, description) VALUES
  ('خطة تسويقية', 'إعداد خطة تسويقية شاملة للعميل'),
  ('إدارة صفحات وتصاميم', 'إدارة صفحات التواصل الاجتماعي وتصميم المحتوى'),
  ('إدارة إعلانات', 'إدارة الحملات الإعلانية المدفوعة'),
  ('تصميم هوية بصرية', 'تصميم الشعار والهوية البصرية الكاملة'),
  ('إنشاء موقع إلكتروني', 'تصميم وتطوير المواقع الإلكترونية'),
  ('تصوير فوتوغرافي', 'جلسات التصوير الفوتوغرافي للمنتجات والخدمات');