import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { customersService } from "./customersService";
import type { CustomerService as AppCustomerService } from "@/types";

type Service = Database["public"]["Tables"]["services"]["Row"];
type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
type CustomerService = Database["public"]["Tables"]["customer_services"]["Row"];
type CustomerServiceInsert = Database["public"]["Tables"]["customer_services"]["Insert"];
type CustomerServiceUpdate = Database["public"]["Tables"]["customer_services"]["Update"];

export const servicesService = {
  // الحصول على جميع الخدمات
  async getAllServices() {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // إضافة خدمة جديدة
  async createService(service: ServiceInsert) {
    const { data, error } = await supabase
      .from("services")
      .insert([service])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // الحصول على خدمات عميل محدد
  async getCustomerServices(customerId: string) {
    const { data, error } = await supabase
      .from("customer_services")
      .select(`
        *,
        service:services(id, name, description)
      `)
      .eq("customer_id", customerId)
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getServicesByCustomer(customerId: string) {
    const { data, error } = await supabase
      .from("customer_services")
      .select("*")
      .eq("customer_id", customerId)
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createCustomerService(service: CustomerServiceInsert) {
    const { data, error } = await supabase
      .from("customer_services")
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // إضافة خدمة لعميل
  async addServiceToCustomer(customerId: string, serviceId: string) {
    const { data, error } = await supabase
      .from("customer_services")
      .insert({
        customer_id: customerId,
        service_id: serviceId,
        start_date: new Date().toISOString() // Add default start_date
      })
      .select(`
        *,
        service:services(id, name, description)
      `)
      .single();

    if (error) throw error;

    // إضافة نشاط تلقائي
    if (data && customerId) {
      const serviceName = data.service ? data.service.name : "خدمة جديدة";
      await customersService.addActivity(
        customerId,
        "service_added",
        `تم إضافة خدمة: ${serviceName}`
      );
    }

    return data;
  },

  // تحديث خدمة عميل
  async updateCustomerService(id: string, updates: CustomerServiceUpdate) {
    const { data, error } = await supabase
      .from("customer_services")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        service:services(id, name, description)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // حذف خدمة من عميل
  async removeServiceFromCustomer(id: string) {
    const { error } = await supabase
      .from("customer_services")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },

  // ✅ alias for the page: deleteCustomerService(...)
  // this keeps your existing name (removeServiceFromCustomer) AND satisfies the component
  async deleteCustomerService(id: string) {
    return this.removeServiceFromCustomer(id);
  },

  // الحصول على جميع خدمات العملاء
  async getAllCustomerServices(): Promise<AppCustomerService[]> {
    const { data, error } = await supabase
      .from("customer_services")
      .select(`
        *,
        service:services(id, name, description),
        customer:customers(id, name)
      `)
      .order("start_date", { ascending: false });

    if (error) throw error;
    return (data as AppCustomerService[]) || [];
  }
};
