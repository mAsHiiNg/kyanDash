-- إنشاء جدول خدمات العملاء (customer_services)
CREATE TABLE IF NOT EXISTS customer_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customer_services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all customer_services" ON customer_services FOR SELECT USING (true);
CREATE POLICY "Users can insert customer_services" ON customer_services FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update customer_services" ON customer_services FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete customer_services" ON customer_services FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create indexes
CREATE INDEX idx_customer_services_customer_id ON customer_services(customer_id);
CREATE INDEX idx_customer_services_service_id ON customer_services(service_id);
CREATE INDEX idx_customer_services_status ON customer_services(status);

-- إنشاء جدول الأنشطة (activities) - للـ Timeline
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('created', 'status_changed', 'meeting_added', 'quotation_sent', 'followup_added', 'service_added', 'note_added')),
  description TEXT NOT NULL,
  metadata JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Users can insert activities" ON activities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes
CREATE INDEX idx_activities_customer_id ON activities(customer_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_type ON activities(type);