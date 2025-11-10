import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Save } from "lucide-react";
import { CUSTOMER_SOURCE_LABELS, CUSTOMER_STATUS_LABELS } from "@/lib/constants";
import { customersService } from "@/services/customersService";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";


// types for users we fetch from supabase
type SupabaseUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export default function AddCustomerPage() {
  useAuthRedirect();

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // list of users to assign to
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    source: "instagram",
    city: "",
    country: "السعودية",
    business_type: "",
    status: "new_contact",
    notes: "",
    // start with empty -> admin chooses
    assigned_to: "",
  });

  // fetch users from supabase so admin can choose
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);

        // we call supabase REST directly so we don't depend on client path
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?select=id,name,email&order=created_at.desc`;
        const res = await fetch(url, {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch users", await res.text());
          return;
        }

        const data: SupabaseUser[] = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // build payload and drop assigned_to if empty
      const payload: any = { ...formData };
      if (!payload.assigned_to) {
        delete payload.assigned_to;
      }

      await customersService.createCustomer(payload);
      router.push("/customers");
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("حدث خطأ أثناء إضافة العميل");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-slate-900">
                إضافة عميل جديد
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                رجوع
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  المعلومات الأساسية
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700">
                      الاسم الكامل <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="مثال: شركة التسويق الرقمي"
                      className="bg-slate-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700">
                      رقم الجوال <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="مثال: +966501234567"
                      className="bg-slate-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">
                      البريد الإلكتروني
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="مثال: info@company.com"
                      className="bg-slate-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_type" className="text-slate-700">
                      نوع النشاط التجاري
                    </Label>
                    <Input
                      id="business_type"
                      type="text"
                      value={formData.business_type}
                      onChange={(e) => handleChange("business_type", e.target.value)}
                      placeholder="مثال: مطعم، متجر إلكتروني، صالون"
                      className="bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  الموقع
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-slate-700">
                      الدولة
                    </Label>
                    <Input
                      id="country"
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      placeholder="السعودية"
                      className="bg-slate-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-700">
                      المدينة
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="مثال: الرياض، جدة، الدمام"
                      className="bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Lead Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  معلومات التواصل
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source" className="text-slate-700">
                      مصدر التواصل <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) => handleChange("source", value)}
                    >
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CUSTOMER_SOURCE_LABELS).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-slate-700">
                      الحالة الحالية <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange("status", value)}
                    >
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CUSTOMER_STATUS_LABELS).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Assign to user */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  تعيين لموظف
                </h3>
                <div className="space-y-2">
                  <Label className="text-slate-700">
                    اختر الموظف المسؤول
                  </Label>
                  <Select
                    value={formData.assigned_to}
                    onValueChange={(value) => handleChange("assigned_to", value)}
                  >
                    <SelectTrigger className="bg-slate-50">
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* no assignment option */}
                      <SelectItem value="Null">بدون تعيين</SelectItem>
                      {usersLoading ? (
                        <SelectItem value="loading" disabled>
                          جارِ تحميل الموظفين...
                        </SelectItem>
                      ) : (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email || user.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    إذا تركته فارغًا لن يتم ربط العميل بأي موظف.
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  ملاحظات
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-700">
                    ملاحظات أولية
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="أي ملاحظات أو تفاصيل إضافية عن العميل..."
                    rows={4}
                    className="bg-slate-50 resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "جاري الحفظ..." : "حفظ العميل"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
