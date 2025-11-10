-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إضافة Triggers لتحديث updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_followups_updated_at BEFORE UPDATE ON followups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_services_updated_at BEFORE UPDATE ON customer_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إنشاء دالة لإضافة نشاط تلقائياً عند إنشاء عميل جديد
CREATE OR REPLACE FUNCTION create_customer_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activities (customer_id, type, description, created_by)
  VALUES (NEW.id, 'created', 'تم إنشاء العميل', NEW.assigned_to);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customer_created_activity AFTER INSERT ON customers
  FOR EACH ROW EXECUTE FUNCTION create_customer_activity();

-- إنشاء دالة لإضافة نشاط عند تغيير حالة العميل
CREATE OR REPLACE FUNCTION customer_status_changed_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO activities (customer_id, type, description, metadata)
    VALUES (
      NEW.id,
      'status_changed',
      'تم تغيير حالة العميل',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customer_status_changed AFTER UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION customer_status_changed_activity();