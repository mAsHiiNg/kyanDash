import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import type { Customer, CustomerStatus } from "@/types";

type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];

// allowed activity types in your DB (from your SQL migrations)
type ActivityType =
  | "created"
  | "status_changed"
  | "meeting_added"
  | "quotation_sent"
  | "followup_added"
  | "service_added"
  | "note_added";

export const customersService = {
  // الحصول على جميع العملاء
  async getAllCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from("customers")
      .select(
        `
        *,
        assigned_user:users(id, name, email, phone)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as unknown as Customer[]) || [];
  },

  // الحصول على عميل واحد بالتفاصيل
  async getCustomerById(id: string) {
    const { data, error } = await supabase
      .from("customers")
      .select(
        `
        *,
        assigned_user:users(id, name, email, phone),
        meetings(
          id,
          meeting_date,
          meeting_type,
          purpose,
          summary,
          attachments,
          created_at
        ),
        quotations(
          id,
          quotation_no,
          send_date,
          amount,
          services,
          currency,
          status,
          reason,
          validity_date,
          created_at
        ),
        followups(
          id,
          followup_date,
          method,
          notes,
          next_followup,
          is_done,
          created_at
        ),
        customer_services(
          id,
          start_date,
          status,
          notes,
          service:services(id, name, description)
        ),
        activities(
          id,
          type,
          description,
          created_at
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as any;
  },

  // البحث في العملاء
  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from("customers")
      .select(
        `
        *,
        assigned_user:users(id, name, email, phone)
      `
      )
      .or(
        `name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as unknown as Customer[]) || [];
  },

  // تصفية العملاء حسب الحالة
  async filterCustomersByStatus(status: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from("customers")
      .select(
        `
        *,
        assigned_user:users(id, name, email, phone)
      `
      )
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as unknown as Customer[]) || [];
  },

  // الحصول على العملاء الفعليين فقط
  async getActiveCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from("customers")
      .select(
        `
        *,
        assigned_user:users(id, name, email, phone),
        customer_services(
          id,
          start_date,
          status,
          notes,
          service:services(id, name, description)
        )
      `
      )
      .eq("status", "active_client")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as unknown as Customer[]) || [];
  },

  // إضافة عميل جديد
  async createCustomer(customer: CustomerInsert) {
    const { data, error } = await supabase
      .from("customers")
      .insert([customer])
      .select()
      .single();

    if (error) throw error;

    // إضافة نشاط تلقائي (ما نخلي الخطأ هنا يكسّر الإضافة)
    if (data) {
      try {
        await this.addActivity(
          data.id,
          "created", // ✅ valid according to your CHECK constraint
          `تم إضافة العميل: ${customer.name ?? ""}`
        );
      } catch (activityError) {
        // فقط نسجله في الكونسول عشان ما نوقف تدفق الواجهة
        console.warn(
          "[customersService] activity insert failed after customer creation:",
          activityError
        );
      }
    }

    return data;
  },

  // تحديث بيانات عميل
  async updateCustomer(id: string, updates: CustomerUpdate) {
    const { data, error } = await supabase
      .from("customers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // إضافة نشاط تلقائي عند تغيير الحالة
    if (data && updates.status) {
      const statusLabel = updates.status as CustomerStatus;
      try {
        await this.addActivity(
          data.id,
          "status_changed",
          `تم تغيير الحالة إلى: ${statusLabel}`
        );
      } catch (activityError) {
        console.warn(
          "[customersService] activity insert failed after status change:",
          activityError
        );
      }
    }

    return data;
  },

  // حذف عميل
  async deleteCustomer(id: string) {
    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) throw error;
    return true;
  },

  // إضافة نشاط للعميل
  async addActivity(
    customerId: string,
    type: ActivityType,
    description: string
  ) {
    const { error } = await supabase.from("activities").insert([
      {
        customer_id: customerId,
        type,
        description,
      },
    ]);

    if (error) throw error;
    return true;
  },

  // إحصائيات Dashboard
  async getDashboardStats() {
    // إجمالي العملاء
    const { count: totalCustomers } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    // العملاء الجدد اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: newToday } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // العروض المرسلة
    const { count: quotationsSent } = await supabase
      .from("quotations")
      .select("*", { count: "exact", head: true })
      .eq("status", "sent");

    // العملاء الفعليين
    const { count: activeClients } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("status", "active_client");

    // المتابعات المقررة اليوم
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { count: followupsToday } = await supabase
      .from("followups")
      .select("*", { count: "exact", head: true })
      .gte("followup_date", today.toISOString())
      .lt("followup_date", tomorrow.toISOString())
      .eq("is_done", false);

    // توزيع العملاء حسب الحالة
    const { data: statusDistribution, error } = await supabase
      .from("customers")
      .select("status");

    if (error) throw error;

    const statusCounts: Record<string, number> = {};
    statusDistribution?.forEach((customer) => {
      const status = customer.status as CustomerStatus;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return {
      totalCustomers: totalCustomers || 0,
      newToday: newToday || 0,
      quotationsSent: quotationsSent || 0,
      activeClients: activeClients || 0,
      followupsToday: followupsToday || 0,
      statusDistribution: statusCounts,
    };
  },

  // إحصائيات التقارير
  async getReportsStats() {
    // العملاء حسب المصدر
    const { data: sourceData, error: sourceError } = await supabase
      .from("customers")
      .select("source");

    if (sourceError) throw sourceError;

    const sourceCounts: Record<string, number> = {};
    sourceData?.forEach((customer) => {
      sourceCounts[customer.source] =
        (sourceCounts[customer.source] || 0) + 1;
    });

    // العملاء الجدد آخر 7 أيام
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: weeklyData, error: weeklyError } = await supabase
      .from("customers")
      .select("created_at")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    if (weeklyError) throw weeklyError;

    // العروض المقبولة والمرفوضة
    const { count: acceptedQuotations } = await supabase
      .from("quotations")
      .select("*", { count: "exact", head: true })
      .eq("status", "accepted");

    const { count: rejectedQuotations } = await supabase
      .from("quotations")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected");

    // أسباب الرفض
    const { data: rejectionReasons, error: reasonError } = await supabase
      .from("quotations")
      .select("reason")
      .eq("status", "rejected")
      .not("reason", "is", null);

    if (reasonError) throw reasonError;

    const reasonCounts: Record<string, number> = {};
    rejectionReasons?.forEach((quotation) => {
      if (quotation.reason) {
        reasonCounts[quotation.reason] =
          (reasonCounts[quotation.reason] || 0) + 1;
      }
    });

    return {
      sourceCounts,
      weeklyData: weeklyData || [],
      acceptedQuotations: acceptedQuotations || 0,
      rejectedQuotations: rejectedQuotations || 0,
      reasonCounts,
    };
  },
};
