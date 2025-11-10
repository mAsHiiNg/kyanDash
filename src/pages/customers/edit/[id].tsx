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
import { ArrowRight, Save, Trash2, Loader2 } from "lucide-react";
import { CustomerSource, CustomerStatus } from "@/types";
import { CUSTOMER_SOURCE_LABELS, CUSTOMER_STATUS_LABELS } from "@/lib/constants";
import { customersService } from "@/services/customersService";
import { useToast } from "@/hooks/use-toast";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

type FormData = {
  name: string;
  phone: string;
  email: string;
  source: CustomerSource;
  city: string;
  country: string;
  business_type: string;
  status: CustomerStatus;
  notes: string;
  assigned_to: string;
};

export default function EditCustomerPage() {
  useAuthRedirect();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    source: "instagram",
    city: "",
    country: "",
    business_type: "",
    status: "new_contact",
    notes: "",
    assigned_to: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id && typeof id === "string") {
      loadCustomer(id);
    }
  }, [id]);

  const loadCustomer = async (customerId: string) => {
    try {
      setLoading(true);
      const customer = await customersService.getCustomerById(customerId);
      if (customer) {
        setFormData({
          name: customer.name,
          phone: customer.phone,
          email: customer.email || "",
          source: customer.source as CustomerSource,
          city: customer.city || "",
          country: customer.country || "السعودية",
          business_type: customer.business_type || "",
          status: customer.status as CustomerStatus,
          notes: customer.notes || "",
          assigned_to: customer.assigned_to || ""
        });
      } else {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على العميل",
          variant: "destructive"
        });
        router.push("/customers");
      }
    } catch (error) {
      console.error("Error loading customer:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل بيانات العميل",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!id || typeof id !== "string") return;

    try {
      setSubmitting(true);
      await customersService.updateCustomer(id, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        source: formData.source,
        city: formData.city || null,
        country: formData.country || null,
        business_type: formData.business_type || null,
        status: formData.status,
        notes: formData.notes || null,
        assigned_to: formData.assigned_to || null
      });

      toast({
        title: "نجح!",
        description: "تم تحديث بيانات العميل بنجاح"
      });
      router.push(`/customers/${id}`);
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث بيانات العميل",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || typeof id !== "string") return;
    
    if (!confirm("هل أنت متأكد من حذف هذا العميل؟ سيتم حذف جميع البيانات المرتبطة به.")) return;

    try {
      setSubmitting(true);
      await customersService.deleteCustomer(id);
      toast({
        title: "تم الحذف",
        description: "تم حذف العميل بنجاح"
      });
      router.push("/customers");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف العميل",
        variant: "destructive"
      });
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-slate-900">تعديل بيانات العميل</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
                disabled={submitting}
              >
                <ArrowRight className="w-4 h-4" />
                رجوع
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">المعلومات الأساسية</h3>
                
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
                      className="bg-slate-50"
                      disabled={submitting}
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
                      className="bg-slate-50"
                      disabled={submitting}
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
                      className="bg-slate-50"
                      disabled={submitting}
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
                      className="bg-slate-50"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">الموقع</h3>
                
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
                      className="bg-slate-50"
                      disabled={submitting}
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
                      className="bg-slate-50"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">معلومات التواصل</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source" className="text-slate-700">
                      مصدر التواصل <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) => handleChange("source", value)}
                      disabled={submitting}
                    >
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CUSTOMER_SOURCE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
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
                      disabled={submitting}
                    >
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CUSTOMER_STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">ملاحظات</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-700">
                    ملاحظات
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={4}
                    className="bg-slate-50 resize-none"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        حفظ التغييرات
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={submitting}
                  >
                    إلغاء
                  </Button>
                </div>
                
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="gap-2"
                  disabled={submitting}
                >
                  <Trash2 className="w-4 h-4" />
                  حذف العميل
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
