import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { customersService } from "./customersService";

type Quotation = Database["public"]["Tables"]["quotations"]["Row"];
type QuotationInsert = Database["public"]["Tables"]["quotations"]["Insert"];
type QuotationUpdate = Database["public"]["Tables"]["quotations"]["Update"];

export const quotationsService = {
  // الحصول على جميع العروض
  async getAllQuotations() {
    const { data, error } = await supabase
      .from("quotations")
      .select(`
        *,
        customer:customers(*)
      `)
      .order("send_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // الحصول على عروض عميل محدد
  async getCustomerQuotations(customerId: string) {
    const { data, error } = await supabase
      .from("quotations")
      .select("*")
      .eq("customer_id", customerId)
      .order("send_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getQuotationsByCustomer(customerId: string) {
    const { data, error } = await supabase
      .from("quotations")
      .select("*")
      .eq("customer_id", customerId)
      .order("send_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // إضافة عرض جديد
  async createQuotation(quotation: QuotationInsert) {
    // توليد رقم العرض تلقائياً
    const { count } = await supabase
      .from("quotations")
      .select("*", { count: "exact", head: true });

    const quotationNo = `Q-${String((count || 0) + 1).padStart(5, "0")}`;

    const { data, error } = await supabase
      .from("quotations")
      .insert([
        {
          ...quotation,
          quotation_no: quotationNo,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // إضافة نشاط تلقائي (مع حماية من خطأ activities_type_check)
    if (data && quotation.customer_id) {
      try {
        await customersService.addActivity(
          quotation.customer_id,
          "quotation_sent" as any,
          `تم إرسال عرض رقم: ${quotationNo}`
        );
      } catch (activityError) {
        // ما نخلي الخطأ يكسر العملية الأساسية
        console.warn(
          "quotationsService.createQuotation: failed to add activity",
          activityError
        );
      }
    }

    return data;
  },

  // تحديث عرض
  async updateQuotation(id: string, updates: QuotationUpdate) {
    const { data, error } = await supabase
      .from("quotations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // هنا عندنا data من التحديث فيها customer_id و quotation_no
    if (data && updates.status) {
      const customerId = data.customer_id;
      const quotationNo = data.quotation_no;

      if (customerId) {
        try {
          await customersService.addActivity(
            customerId,
            "quotation_status_changed" as any,
            `تم تحديث حالة العرض ${quotationNo} إلى: ${updates.status}`
          );
        } catch (activityError) {
          console.warn(
            "quotationsService.updateQuotation: failed to add activity",
            activityError
          );
        }
      }
    }

    return data;
  },

  // حذف عرض
  async deleteQuotation(id: string) {
    const { error } = await supabase
      .from("quotations")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },
};
