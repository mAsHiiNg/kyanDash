import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { customersService } from "./customersService";

type Followup = Database["public"]["Tables"]["followups"]["Row"];
type FollowupInsert = Database["public"]["Tables"]["followups"]["Insert"];
type FollowupUpdate = Database["public"]["Tables"]["followups"]["Update"];

export const followupsService = {
  // الحصول على جميع المتابعات مع بيانات العميل
  async getAllFollowups() {
    const { data, error } = await supabase
      .from("followups")
      .select(`
        *,
        customer:customers(*)
      `)
      .order("followup_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // الحصول على متابعات عميل محدد
  async getCustomerFollowups(customerId: string) {
    const { data, error } = await supabase
      .from("followups")
      .select("*")
      .eq("customer_id", customerId)
      .order("followup_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // الحصول على المتابعات اليوم
  async getTodayFollowups() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from("followups")
      .select(`
        *,
        customer:customers(*)
      `)
      .gte("followup_date", today.toISOString())
      .lt("followup_date", tomorrow.toISOString())
      .eq("is_done", false)
      .order("followup_date", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // الحصول على المتابعات المتأخرة
  async getOverdueFollowups() {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("followups")
      .select(`
        *,
        customer:customers(*)
      `)
      .lt("followup_date", now)
      .eq("is_done", false)
      .order("followup_date", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getFollowupsByCustomer(customerId: string) {
    const { data, error } = await supabase
      .from("followups")
      .select("*")
      .eq("customer_id", customerId)
      .order("followup_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // إضافة متابعة جديدة
  async createFollowup(followup: FollowupInsert) {
    const { data, error } = await supabase
      .from("followups")
      .insert([followup])
      .select()
      .single();

    if (error) throw error;

    // إضافة نشاط تلقائي
    if (data && followup.customer_id) {
      await customersService.addActivity(
        followup.customer_id,
        "followup_added",
        `تم إضافة متابعة: ${followup.method}`
      );
    }

    return data;
  },

  // تحديث متابعة
  async updateFollowup(id: string, updates: FollowupUpdate) {
    const { data, error } = await supabase
      .from("followups")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // لو المتابعة صارت مكتملة نسجلها في الأنشطة
    // نستخدم نوع نشاط موجود ("followup_added") حتى ما نخالف الـ check constraint
    if (data && updates.is_done === true && data.customer_id) {
      await customersService.addActivity(
        data.customer_id,
        "followup_added",
        "تم إكمال المتابعة"
      );
    }

    return data;
  },

  // حذف متابعة
  async deleteFollowup(id: string) {
    const { error } = await supabase
      .from("followups")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }
};
