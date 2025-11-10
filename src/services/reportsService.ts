import { supabase } from "@/integrations/supabase/client";

export const reportsService = {
  async getCustomerSourceStats() {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("source");

      if (error) throw error;

      const sourceCounts: Record<string, number> = {};
      data?.forEach((customer) => {
        const source = customer.source || "غير محدد";
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });

      return Object.entries(sourceCounts).map(([source, count]) => ({
        source,
        count,
      }));
    } catch (error) {
      console.error("Error getting customer source stats:", error);
      throw error;
    }
  },

  async getCustomerStatusStats() {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("status");

      if (error) throw error;

      const statusCounts: Record<string, number> = {};
      data?.forEach((customer) => {
        const status = customer.status || "جديد";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      return Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      }));
    } catch (error) {
      console.error("Error getting customer status stats:", error);
      throw error;
    }
  },

  async getQuotationStats() {
    try {
      const { data, error } = await supabase
        .from("quotations")
        .select("status, amount");

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        sent: data?.filter((q) => q.status === "مرسل").length || 0,
        accepted: data?.filter((q) => q.status === "مقبول").length || 0,
        rejected: data?.filter((q) => q.status === "مرفوض").length || 0,
        totalAmount: data?.reduce((sum, q) => sum + (Number(q.amount) || 0), 0) || 0,
        acceptedAmount:
          data
            ?.filter((q) => q.status === "مقبول")
            .reduce((sum, q) => sum + (Number(q.amount) || 0), 0) || 0,
      };

      return stats;
    } catch (error) {
      console.error("Error getting quotation stats:", error);
      throw error;
    }
  },

  async getMonthlyCustomerGrowth() {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("created_at")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const monthCounts: Record<string, number> = {};
      data?.forEach((customer) => {
        const date = new Date(customer.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
      });

      return Object.entries(monthCounts).map(([month, count]) => ({
        month,
        count,
      }));
    } catch (error) {
      console.error("Error getting monthly customer growth:", error);
      throw error;
    }
  },

  async getEmployeePerformance() {
    try {
      const { data: customers, error: customersError } = await supabase
        .from("customers")
        .select(`
          assigned_to,
          profiles!customers_assigned_to_fkey (
            full_name
          )
        `);

      if (customersError) throw customersError;

      const employeeCounts: Record<string, { name: string; count: number }> = {};
      
      customers?.forEach((customer) => {
        if (customer.assigned_to && customer.profiles) {
          const profile = Array.isArray(customer.profiles) ? customer.profiles[0] : customer.profiles;
          const employeeId = customer.assigned_to;
          const employeeName = profile?.full_name || "غير محدد";

          if (!employeeCounts[employeeId]) {
            employeeCounts[employeeId] = { name: employeeName, count: 0 };
          }
          employeeCounts[employeeId].count += 1;
        }
      });

      return Object.entries(employeeCounts).map(([id, data]) => ({
        id,
        name: data.name,
        count: data.count,
      }));
    } catch (error) {
      console.error("Error getting employee performance:", error);
      throw error;
    }
  },

  async getConversionRate() {
    try {
      const { data: allCustomers, error: allError } = await supabase
        .from("customers")
        .select("id");

      const { data: activeCustomers, error: activeError } = await supabase
        .from("customers")
        .select("id")
        .eq("status", "عميل فعلي");

      if (allError || activeError) throw allError || activeError;

      const total = allCustomers?.length || 0;
      const active = activeCustomers?.length || 0;
      const rate = total > 0 ? (active / total) * 100 : 0;

      return {
        total,
        active,
        rate: Math.round(rate * 10) / 10,
      };
    } catch (error) {
      console.error("Error getting conversion rate:", error);
      throw error;
    }
  },

  async getRejectionReasons() {
    try {
      const { data, error } = await supabase
        .from("quotations")
        .select("reason")
        .eq("status", "مرفوض")
        .not("reason", "is", null);

      if (error) throw error;

      const reasonCounts: Record<string, number> = {};
      data?.forEach((quotation) => {
        const reason = quotation.reason || "غير محدد";
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });

      return Object.entries(reasonCounts)
        .map(([reason, count]) => ({
          reason,
          count,
        }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error("Error getting rejection reasons:", error);
      throw error;
    }
  },
};
