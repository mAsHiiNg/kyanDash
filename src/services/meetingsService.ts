
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { customersService } from "./customersService";

type Meeting = Database["public"]["Tables"]["meetings"]["Row"];
type MeetingInsert = Database["public"]["Tables"]["meetings"]["Insert"];
type MeetingUpdate = Database["public"]["Tables"]["meetings"]["Update"];

export const meetingsService = {
  // الحصول على جميع الاجتماعات
  async getAllMeetings() {
    const { data, error } = await supabase
      .from("meetings")
      .select(`
        *,
        customer:customers(id, name, phone)
      `)
      .order("meeting_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // الحصول على اجتماعات عميل محدد
  async getCustomerMeetings(customerId: string) {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("customer_id", customerId)
      .order("meeting_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getMeetingsByCustomer(customerId: string) {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("customer_id", customerId)
      .order("meeting_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // إضافة اجتماع جديد
  async createMeeting(meeting: MeetingInsert) {
    const { data, error } = await supabase
      .from("meetings")
      .insert([meeting])
      .select()
      .single();

    if (error) throw error;

    // إضافة نشاط تلقائي
    if (data && meeting.customer_id) {
      await customersService.addActivity(
        meeting.customer_id,
        "meeting_added",
        `تم إضافة اجتماع: ${meeting.meeting_type}`
      );
    }

    return data;
  },

  // تحديث اجتماع
  async updateMeeting(id: string, updates: MeetingUpdate) {
    const { data, error } = await supabase
      .from("meetings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // حذف اجتماع
  async deleteMeeting(id: string) {
    const { error } = await supabase
      .from("meetings")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }
};
