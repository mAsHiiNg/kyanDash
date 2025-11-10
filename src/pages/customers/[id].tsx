import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRight,
  Edit,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  User,
  Calendar,
  FileText,
  Target,
  Package,
  Clock,
  MessageCircle,
  Building2,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  ListChecks,
  Trash2,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_SOURCE_LABELS,
  MEETING_TYPE_LABELS,
  QUOTATION_STATUS_LABELS,
  FOLLOWUP_METHOD_LABELS,
} from "@/lib/constants";
import { customersService } from "@/services/customersService";
import { meetingsService } from "@/services/meetingsService";
import { quotationsService } from "@/services/quotationsService";
import { followupsService } from "@/services/followupsService";
import { servicesService } from "@/services/servicesService";
import type { Database } from "@/integrations/supabase/types";
import { CustomerStatus } from "@/types";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type Meeting = Database["public"]["Tables"]["meetings"]["Row"];
type Quotation = Database["public"]["Tables"]["quotations"]["Row"];
type Followup = Database["public"]["Tables"]["followups"]["Row"];
type CustomerService = Database["public"]["Tables"]["customer_services"]["Row"];

export default function CustomerDetailsPage() {
  useAuthRedirect();

  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [services, setServices] = useState<CustomerService[]>([]);

  // add dialogs
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
  const [followupDialogOpen, setFollowupDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);

  // view dialogs
  const [meetingDetailsOpen, setMeetingDetailsOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const [quotationDetailsOpen, setQuotationDetailsOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  const [followupDetailsOpen, setFollowupDetailsOpen] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState<Followup | null>(null);

  const [serviceDetailsOpen, setServiceDetailsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<CustomerService | null>(null);

  // edit dialogs
  const [editMeetingOpen, setEditMeetingOpen] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState<Meeting | null>(null);

  const [editQuotationOpen, setEditQuotationOpen] = useState(false);
  const [quotationToEdit, setQuotationToEdit] = useState<Quotation | null>(null);

  const [editFollowupOpen, setEditFollowupOpen] = useState(false);
  const [followupToEdit, setFollowupToEdit] = useState<Followup | null>(null);

  const [editServiceOpen, setEditServiceOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<CustomerService | null>(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id && typeof id === "string") {
      loadAllData(id);
    }
  }, [id]);

  const loadAllData = async (customerId: string) => {
    try {
      setLoading(true);
      const [
        customerData,
        meetingsData,
        quotationsData,
        followupsData,
        servicesData,
      ] = await Promise.all([
        customersService.getCustomerById(customerId),
        meetingsService.getMeetingsByCustomer(customerId),
        quotationsService.getQuotationsByCustomer(customerId),
        followupsService.getFollowupsByCustomer(customerId),
        servicesService.getServicesByCustomer(customerId),
      ]);

      setCustomer(customerData);
      setMeetings(meetingsData);
      setQuotations(quotationsData);
      setFollowups(followupsData);
      setServices(servicesData);
    } catch (error) {
      console.error("Error loading customer data:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل بيانات العميل",
        variant: "destructive",
      });
      router.push("/customers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customer) return;

    const formData = new FormData(e.currentTarget);

    try {
      setSubmitting(true);
      const newMeeting = await meetingsService.createMeeting({
        customer_id: customer.id,
        meeting_date: formData.get("meetingDate") as string,
        meeting_type: formData.get("meetingType") as string,
        goal: (formData.get("goal") as string) || null,
        summary: (formData.get("summary") as string) || null,
        purpose: (formData.get("goal") as string) || "Meeting",
      });

      setMeetings((prev) => [newMeeting, ...prev]);
      setMeetingDialogOpen(false);
      toast({ title: "تم إضافة الاجتماع بنجاح" });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الاجتماع",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!meetingToEdit) return;

    const formData = new FormData(e.currentTarget);

    try {
      setSubmitting(true);
      const updated = await meetingsService.updateMeeting(meetingToEdit.id, {
        meeting_date: formData.get("meetingDate") as string,
        meeting_type: formData.get("meetingType") as string,
        goal: (formData.get("goal") as string) || null,
        summary: (formData.get("summary") as string) || null,
        purpose: (formData.get("goal") as string) || meetingToEdit.purpose || "Meeting",
      });

      setMeetings((prev) =>
        prev.map((m) => (m.id === meetingToEdit.id ? updated : m))
      );
      setEditMeetingOpen(false);
      toast({ title: "تم تعديل الاجتماع" });
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تعديل الاجتماع",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    const ok = window.confirm("هل أنت متأكد من حذف هذا الاجتماع؟");
    if (!ok) return;
    try {
      await meetingsService.deleteMeeting(meetingId);
      setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
      toast({ title: "تم حذف الاجتماع" });
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الاجتماع",
        variant: "destructive",
      });
    }
  };

  const handleAddQuotation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customer) return;

    const formData = new FormData(e.currentTarget);
    const servicesText = formData.get("services") as string;
    const servicesArray = servicesText.split("\n").filter((s) => s.trim());

    try {
      setSubmitting(true);
      const quotationNo = `Q-2025-${String(quotations.length + 1).padStart(3, "0")}`;

      const newQuotation = await quotationsService.createQuotation({
        customer_id: customer.id,
        quotation_no: quotationNo,
        send_date: (formData.get("sendDate") as string) || null,
        amount: parseFloat(formData.get("amount") as string),
        currency: "OMR",
        services: servicesArray,
        status: (formData.get("status") as string) || "draft",
        validity_date: (formData.get("validityDate") as string) || null,
      });

      setQuotations((prev) => [newQuotation, ...prev]);
      setQuotationDialogOpen(false);
      toast({ title: "تم إضافة العرض بنجاح" });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error creating quotation:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العرض",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateQuotation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!quotationToEdit) return;

    const formData = new FormData(e.currentTarget);
    const servicesText = formData.get("services") as string;
    const servicesArray = servicesText.split("\n").filter((s) => s.trim());

    try {
      setSubmitting(true);
      const updated = await quotationsService.updateQuotation(quotationToEdit.id, {
        send_date: (formData.get("sendDate") as string) || null,
        amount: parseFloat(formData.get("amount") as string),
        currency: "OMR",
        services: servicesArray,
        status: (formData.get("status") as string) || "draft",
        validity_date: (formData.get("validityDate") as string) || null,
      });

      setQuotations((prev) =>
        prev.map((q) => (q.id === quotationToEdit.id ? updated : q))
      );
      setEditQuotationOpen(false);
      toast({ title: "تم تعديل العرض" });
    } catch (error) {
      console.error("Error updating quotation:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تعديل العرض",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuotation = async (quotationId: string) => {
    const ok = window.confirm("هل أنت متأكد من حذف عرض السعر؟");
    if (!ok) return;
    try {
      await quotationsService.deleteQuotation(quotationId);
      setQuotations((prev) => prev.filter((q) => q.id !== quotationId));
      toast({ title: "تم حذف العرض" });
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف العرض",
        variant: "destructive",
      });
    }
  };

  const handleAddFollowup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customer) return;

    const formData = new FormData(e.currentTarget);

    try {
      setSubmitting(true);
      const newFollowup = await followupsService.createFollowup({
        customer_id: customer.id,
        followup_date: formData.get("followupDate") as string,
        method: formData.get("method") as string,
        notes: formData.get("notes") as string,
        next_followup: (formData.get("nextFollowup") as string) || null,
        is_done: false,
        assigned_to: customer.assigned_to,
      });

      setFollowups((prev) => [newFollowup, ...prev]);
      setFollowupDialogOpen(false);
      toast({ title: "تم إضافة المتابعة بنجاح" });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error creating followup:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المتابعة",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

    const handleUpdateFollowup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!followupToEdit) return;

    const formData = new FormData(e.currentTarget);

    try {
      setSubmitting(true);
        const updated = await followupsService.updateFollowup(followupToEdit.id, {
          followup_date: formData.get("followupDate") as string,
          method: formData.get("method") as string,
          notes: formData.get("notes") as string,
          next_followup: (formData.get("nextFollowup") as string) || null,
          is_done: formData.get("isDone") === "true",
        });

        // update UI first
        setFollowups((prev) =>
          prev.map((f) => (f.id === followupToEdit.id ? updated : f))
        );
        setEditFollowupOpen(false);
        toast({ title: "تم تعديل المتابعة" });
      } catch (error: any) {
        // if the ONLY thing failing is the activities insert, don't kill the UX
        const msg = error?.message || "";
        if (msg.includes("activities_type_check")) {
          console.warn("Followup saved but activities log failed:", error);
          setEditFollowupOpen(false);
          toast({
            title: "تم حفظ المتابعة",
            description: "لكن لم يتم تسجيلها في السجل الزمني بسبب نوع غير صالح.",
          });
        } else {
          console.error("Error updating followup:", error);
          toast({
            title: "خطأ",
            description: "حدث خطأ أثناء تعديل المتابعة",
            variant: "destructive",
          });
        }
    } finally {
      setSubmitting(false);
    }
  };


  const handleDeleteFollowup = async (followupId: string) => {
    const ok = window.confirm("هل أنت متأكد من حذف المتابعة؟");
    if (!ok) return;
    try {
      await followupsService.deleteFollowup(followupId);
      setFollowups((prev) => prev.filter((f) => f.id !== followupId));
      toast({ title: "تم حذف المتابعة" });
    } catch (error) {
      console.error("Error deleting followup:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المتابعة",
        variant: "destructive",
      });
    }
  };

  const handleAddService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customer) return;

    const formData = new FormData(e.currentTarget);
    const serviceName = formData.get("serviceName") as string;

    try {
      setSubmitting(true);

      const newServiceEntry = await servicesService.createService({
        name: serviceName,
        is_active: true,
      });

      if (!newServiceEntry) {
        throw new Error("Failed to create the new service entry.");
      }

      const newCustomerService = await servicesService.createCustomerService({
        customer_id: customer.id,
        service_id: newServiceEntry.id,
        service_name: serviceName,
        start_date: formData.get("startDate") as string,
        status: (formData.get("status") as string) || "active",
        notes: (formData.get("notes") as string) || null,
      });

      setServices((prev) => [newCustomerService, ...prev]);
      setServiceDialogOpen(false);
      toast({ title: "تم إضافة الخدمة بنجاح" });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error creating service:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الخدمة",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!serviceToEdit) return;

    const formData = new FormData(e.currentTarget);

    try {
      setSubmitting(true);
      const updated = await servicesService.updateCustomerService(
        serviceToEdit.id,
        {
          service_name: formData.get("serviceName") as string,
          start_date: formData.get("startDate") as string,
          status: (formData.get("status") as string) || "active",
          notes: (formData.get("notes") as string) || null,
        }
      );

      setServices((prev) =>
        prev.map((s) => (s.id === serviceToEdit.id ? updated : s))
      );
      setEditServiceOpen(false);
      toast({ title: "تم تعديل الخدمة" });
    } catch (error) {
      console.error("Error updating service:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تعديل الخدمة",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const ok = window.confirm("هل أنت متأكد من حذف الخدمة؟");
    if (!ok) return;
    try {
      await servicesService.deleteCustomerService(serviceId);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      toast({ title: "تم حذف الخدمة" });
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الخدمة",
        variant: "destructive",
      });
    }
  };

  const toggleFollowupDone = async (followupId: string) => {
    try {
      const followup = followups.find((f) => f.id === followupId);
      if (!followup) return;

      await followupsService.updateFollowup(followupId, {
        is_done: !followup.is_done,
      });

      setFollowups((prev) =>
        prev.map((f) =>
          f.id === followupId ? { ...f, is_done: !f.is_done } : f
        )
      );

      toast({ title: "تم تحديث حالة المتابعة" });
    } catch (error) {
      console.error("Error updating followup:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المتابعة",
        variant: "destructive",
      });
    }
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

  if (!customer) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-slate-500">العميل غير موجود</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Card */}
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    {customer.name}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={customer.status as CustomerStatus} />
                    <span className="text-sm text-slate-500">
                      {CUSTOMER_SOURCE_LABELS[customer.source] ||
                        customer.source}
                    </span>
                    <span className="text-sm text-slate-400">•</span>
                    <span className="text-sm text-slate-500">
                      تاريخ الإضافة:{" "}
                      {new Date(customer.created_at).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/customers/edit/${customer.id}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Button>
                </Link>
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
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">رقم الجوال</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {customer.phone}
                  </p>
                </div>
              </div>

              {customer.email && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-slate-500">البريد الإلكتروني</p>
                    <p className="text-sm font-semibold text-slate-900 truncate max-w-[180px]">
                      {customer.email}
                    </p>
                  </div>
                </div>
              )}

              {customer.city && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-slate-500">الموقع</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {customer.city}
                    </p>
                  </div>
                </div>
              )}

              {customer.business_type && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-slate-500">نوع النشاط</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {customer.business_type}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Card className="bg-white border-slate-200 shadow-lg">
            <Tabs defaultValue="info" className="w-full" dir="rtl">
              <CardHeader className="border-b border-slate-100 pb-0">
                <TabsList className="bg-slate-50 p-1 h-auto">
                  <TabsTrigger
                    value="info"
                    className="gap-2 data-[state=active]:bg-white"
                  >
                    <Building2 className="w-4 h-4" />
                    البيانات الأساسية
                  </TabsTrigger>
                  <TabsTrigger
                    value="meetings"
                    className="gap-2 data-[state=active]:bg-white"
                  >
                    <Calendar className="w-4 h-4" />
                    الاجتماعات ({meetings.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="quotations"
                    className="gap-2 data-[state=active]:bg-white"
                  >
                    <FileText className="w-4 h-4" />
                    العروض ({quotations.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="followups"
                    className="gap-2 data-[state=active]:bg-white"
                  >
                    <Target className="w-4 h-4" />
                    المتابعات ({followups.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="services"
                    className="gap-2 data-[state=active]:bg-white"
                  >
                    <Package className="w-4 h-4" />
                    الخدمات ({services.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="timeline"
                    className="gap-2 data-[state=active]:bg-white"
                  >
                    <Clock className="w-4 h-4" />
                    السجل الزمني
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="p-6">
                {/* Basic Info Tab */}
                <TabsContent value="info" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-900 border-b pb-2">
                        معلومات الاتصال
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">الاسم:</span>
                          <span className="font-medium text-slate-900">
                            {customer.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">رقم الجوال:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">
                              {customer.phone}
                            </span>
                            <a
                              href={`https://wa.me/${customer.phone.replace(
                                /[^0-9]/g,
                                ""
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                        {customer.email && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">
                              البريد الإلكتروني:
                            </span>
                            <span className="font-medium text-slate-900">
                              {customer.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-900 border-b pb-2">
                        معلومات العمل
                      </h3>
                      <div className="space-y-2 text-sm">
                        {customer.business_type && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">نوع النشاط:</span>
                            <span className="font-medium text-slate-900">
                              {customer.business_type}
                            </span>
                          </div>
                        )}
                        {customer.city && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">المدينة:</span>
                            <span className="font-medium text-slate-900">
                              {customer.city}
                            </span>
                          </div>
                        )}
                        {customer.country && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">الدولة:</span>
                            <span className="font-medium text-slate-900">
                              {customer.country}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">مصدر التواصل:</span>
                          <span className="font-medium text-slate-900">
                            {CUSTOMER_SOURCE_LABELS[customer.source] ||
                              customer.source}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {customer.notes && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-900 border-b pb-2">
                        الملاحظات
                      </h3>
                      <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">
                        {customer.notes}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Meetings Tab */}
                <TabsContent value="meetings" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">
                        الاجتماعات والمكالمات
                      </h3>
                      <Dialog
                        open={meetingDialogOpen}
                        onOpenChange={setMeetingDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                            <Plus className="w-4 h-4" />
                            إضافة اجتماع
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]" dir="rtl">
                          <form onSubmit={handleAddMeeting}>
                            <DialogHeader>
                              <DialogTitle>إضافة اجتماع جديد</DialogTitle>
                              <DialogDescription>
                                قم بتسجيل تفاصيل الاجتماع مع العميل
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="meetingDate">
                                  تاريخ ووقت الاجتماع
                                </Label>
                                <Input
                                  id="meetingDate"
                                  name="meetingDate"
                                  type="datetime-local"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="meetingType">نوع الاجتماع</Label>
                                <Select name="meetingType" required>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر نوع الاجتماع" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="in_person">وجاهي</SelectItem>
                                    <SelectItem value="online">أونلاين</SelectItem>
                                    <SelectItem value="phone">هاتفي</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="goal">هدف الاجتماع</Label>
                                <Input
                                  id="goal"
                                  name="goal"
                                  placeholder="مثال: مناقشة الخطة التسويقية"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="summary">ملخص الاجتماع</Label>
                                <Textarea
                                  id="summary"
                                  name="summary"
                                  placeholder="ملاحظات ومخرجات الاجتماع..."
                                  rows={4}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={submitting}>
                                {submitting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                    جاري الحفظ...
                                  </>
                                ) : (
                                  "حفظ الاجتماع"
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {meetings.length === 0 ? (
                      <EmptyState
                        icon={Calendar}
                        title="لا توجد اجتماعات مسجلة"
                        description="ابدأ بجدولة اجتماع مع العميل"
                      />
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">التاريخ</TableHead>
                              <TableHead className="text-right">النوع</TableHead>
                              <TableHead className="text-right">الهدف</TableHead>
                              <TableHead className="text-right">الملخص</TableHead>
                              <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {meetings.map((meeting) => (
                              <TableRow key={meeting.id}>
                                <TableCell className="whitespace-nowrap">
                                  {new Date(
                                    meeting.meeting_date
                                  ).toLocaleString("en-GB")}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {MEETING_TYPE_LABELS[meeting.meeting_type] ||
                                      meeting.meeting_type}
                                  </Badge>
                                </TableCell>
                                <TableCell>{meeting.purpose || "-"}</TableCell>
                                <TableCell className="max-w-xs truncate">
                                  {meeting.summary || "-"}
                                </TableCell>
                                <TableCell className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => {
                                      setSelectedMeeting(meeting);
                                      setMeetingDetailsOpen(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                    عرض
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => {
                                      setMeetingToEdit(meeting);
                                      setEditMeetingOpen(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                    تعديل
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => handleDeleteMeeting(meeting.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    حذف
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Quotations Tab */}
                <TabsContent value="quotations" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">
                        عروض الأسعار
                      </h3>
                      <Dialog
                        open={quotationDialogOpen}
                        onOpenChange={setQuotationDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
                            <Plus className="w-4 h-4" />
                            إضافة عرض سعر
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]" dir="rtl">
                          <form onSubmit={handleAddQuotation}>
                            <DialogHeader>
                              <DialogTitle>إضافة عرض سعر جديد</DialogTitle>
                              <DialogDescription>
                                قم بإنشاء عرض سعر للعميل
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="sendDate">تاريخ الإرسال</Label>
                                <Input
                                  id="sendDate"
                                  name="sendDate"
                                  type="date"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="amount">قيمة العرض (ريال)</Label>
                                <Input
                                  id="amount"
                                  name="amount"
                                  type="number"
                                  step="0.01"
                                  placeholder="15000"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="services">
                                  الخدمات (سطر لكل خدمة)
                                </Label>
                                <Textarea
                                  id="services"
                                  name="services"
                                  placeholder="خطة تسويقية شاملة&#10;إدارة صفحات السوشيال ميديا&#10;تصميم جرافيك"
                                  rows={4}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="validityDate">صلاحية العرض</Label>
                                <Input
                                  id="validityDate"
                                  name="validityDate"
                                  type="date"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="status">الحالة</Label>
                                <Select name="status" defaultValue="sent" required>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="draft">مسودة</SelectItem>
                                    <SelectItem value="sent">مرسل</SelectItem>
                                    <SelectItem value="accepted">مقبول</SelectItem>
                                    <SelectItem value="rejected">مرفوض</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={submitting}>
                                {submitting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                    جاري الحفظ...
                                  </>
                                ) : (
                                  "حفظ العرض"
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {quotations.length === 0 ? (
                      <EmptyState
                        icon={FileText}
                        title="لا توجد عروض أسعار"
                        description="قم بإنشاء عرض سعر جديد للعميل"
                      />
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">
                                رقم العرض
                              </TableHead>
                              <TableHead className="text-right">التاريخ</TableHead>
                              <TableHead className="text-right">القيمة</TableHead>
                              <TableHead className="text-right">الحالة</TableHead>
                              <TableHead className="text-right">الصلاحية</TableHead>
                              <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {quotations.map((quotation) => (
                              <TableRow key={quotation.id}>
                                <TableCell className="font-medium">
                                  {quotation.quotation_no}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {quotation.send_date
                                    ? new Date(
                                        quotation.send_date
                                      ).toLocaleDateString("en-GB")
                                    : "-"}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {quotation.amount.toLocaleString()} ريال
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      quotation.status === "accepted"
                                        ? "default"
                                        : quotation.status === "rejected"
                                        ? "destructive"
                                        : "outline"
                                    }
                                  >
                                    {QUOTATION_STATUS_LABELS[quotation.status] ||
                                      quotation.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {quotation.validity_date
                                    ? new Date(
                                        quotation.validity_date
                                      ).toLocaleDateString("en-GB")
                                    : "-"}
                                </TableCell>
                                <TableCell className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => {
                                      setSelectedQuotation(quotation);
                                      setQuotationDetailsOpen(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                    عرض
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => {
                                      setQuotationToEdit(quotation);
                                      setEditQuotationOpen(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                    تعديل
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() =>
                                      handleDeleteQuotation(quotation.id)
                                    }
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    حذف
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Followups Tab */}
                <TabsContent value="followups" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">
                        المتابعات
                      </h3>
                      <Dialog
                        open={followupDialogOpen}
                        onOpenChange={setFollowupDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button className="gap-2 bg-gradient-to-r from-orange-600 to-red-600">
                            <Plus className="w-4 h-4" />
                            إضافة متابعة
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]" dir="rtl">
                          <form onSubmit={handleAddFollowup}>
                            <DialogHeader>
                              <DialogTitle>إضافة متابعة جديدة</DialogTitle>
                              <DialogDescription>
                                قم بتسجيل متابعة مع العميل
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="followupDate">
                                  تاريخ ووقت المتابعة
                                </Label>
                                <Input
                                  id="followupDate"
                                  name="followupDate"
                                  type="datetime-local"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="method">طريقة المتابعة</Label>
                                <Select name="method" required>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر طريقة المتابعة" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="call">اتصال</SelectItem>
                                    <SelectItem value="whatsapp">واتساب</SelectItem>
                                    <SelectItem value="email">إيميل</SelectItem>
                                    <SelectItem value="meeting">اجتماع</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="notes">الملاحظات</Label>
                                <Textarea
                                  id="notes"
                                  name="notes"
                                  placeholder="تفاصيل المتابعة..."
                                  rows={4}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="nextFollowup">
                                  موعد المتابعة القادمة (اختياري)
                                </Label>
                                <Input
                                  id="nextFollowup"
                                  name="nextFollowup"
                                  type="datetime-local"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={submitting}>
                                {submitting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                    جاري الحفظ...
                                  </>
                                ) : (
                                  "حفظ المتابعة"
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {followups.length === 0 ? (
                      <EmptyState
                        icon={Target}
                        title="لا توجد متابعات مسجلة"
                        description="أضف متابعة جديدة لتتبع تقدم العميل"
                      />
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">التاريخ</TableHead>
                              <TableHead className="text-right">الطريقة</TableHead>
                              <TableHead className="text-right">الملاحظات</TableHead>
                              <TableHead className="text-right">
                                المتابعة القادمة
                              </TableHead>
                              <TableHead className="text-right">الحالة</TableHead>
                              <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {followups.map((followup) => (
                              <TableRow key={followup.id}>
                                <TableCell className="whitespace-nowrap">
                                  {new Date(
                                    followup.followup_date
                                  ).toLocaleString("en-GB")}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {FOLLOWUP_METHOD_LABELS[followup.method] ||
                                      followup.method}
                                  </Badge>
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                  {followup.notes || "-"}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {followup.next_followup
                                    ? new Date(
                                        followup.next_followup
                                      ).toLocaleDateString("en-GB")
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant={followup.is_done ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleFollowupDone(followup.id)}
                                    className="gap-1"
                                  >
                                    {followup.is_done ? (
                                      <>
                                        <CheckCircle2 className="w-3 h-3" />
                                        تمت
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="w-3 h-3" />
                                        لم تتم
                                      </>
                                    )}
                                  </Button>
                                </TableCell>
                                <TableCell className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => {
                                      setSelectedFollowup(followup);
                                      setFollowupDetailsOpen(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                    عرض
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => {
                                      setFollowupToEdit(followup);
                                      setEditFollowupOpen(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                    تعديل
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => handleDeleteFollowup(followup.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    حذف
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">
                        الخدمات المقدمة
                      </h3>
                      <Dialog
                        open={serviceDialogOpen}
                        onOpenChange={setServiceDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button className="gap-2 bg-gradient-to-r from-green-600 to-teal-600">
                            <Plus className="w-4 h-4" />
                            إضافة خدمة
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]" dir="rtl">
                          <form onSubmit={handleAddService}>
                            <DialogHeader>
                              <DialogTitle>إضافة خدمة جديدة</DialogTitle>
                              <DialogDescription>
                                قم بتسجيل خدمة مقدمة للعميل
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="serviceName">اسم الخدمة</Label>
                                <Input
                                  id="serviceName"
                                  name="serviceName"
                                  placeholder="مثال: خطة تسويقية شاملة"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="startDate">تاريخ البداية</Label>
                                <Input
                                  id="startDate"
                                  name="startDate"
                                  type="date"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="status">الحالة</Label>
                                <Select name="status" defaultValue="active" required>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">جاري</SelectItem>
                                    <SelectItem value="completed">مكتمل</SelectItem>
                                    <SelectItem value="paused">متوقف</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="notes">الملاحظات</Label>
                                <Textarea
                                  id="notes"
                                  name="notes"
                                  placeholder="تفاصيل الخدمة..."
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={submitting}>
                                {submitting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                    جاري الحفظ...
                                  </>
                                ) : (
                                  "حفظ الخدمة"
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {services.length === 0 ? (
                      <EmptyState
                        icon={Package}
                        title="لا توجد خدمات نشطة"
                        description="أضف خدمة للعميل لبدء التتبع"
                      />
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">الخدمة</TableHead>
                              <TableHead className="text-right">الحالة</TableHead>
                              <TableHead className="text-right">
                                تاريخ البداية
                              </TableHead>
                              <TableHead className="text-right">الملاحظات</TableHead>
                              <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {services.map((service) => (
                              <TableRow key={service.id}>
                                <TableCell className="font-medium">
                                  {service.service_name}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      service.status === "active"
                                        ? "default"
                                        : service.status === "completed"
                                        ? "outline"
                                        : "destructive"
                                    }
                                  >
                                    {service.status === "active"
                                      ? "جاري"
                                      : service.status === "completed"
                                      ? "مكتمل"
                                      : "متوقف"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {new Date(service.start_date).toLocaleDateString(
                                    "en-GB"
                                  )}
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                  {service.notes || "-"}
                                </TableCell>
                                <TableCell className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => {
                                      setSelectedService(service);
                                      setServiceDetailsOpen(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                    عرض
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => {
                                      setServiceToEdit(service);
                                      setEditServiceOpen(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                    تعديل
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => handleDeleteService(service.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    حذف
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="mt-0">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      السجل الزمني
                    </h3>
                    <div className="space-y-4">
                      {[
                        { type: "customer", date: customer.created_at, data: customer },
                        ...meetings.map((m) => ({
                          type: "meeting",
                          date: m.meeting_date,
                          data: m,
                        })),
                        ...quotations.map((q) => ({
                          type: "quotation",
                          date: q.send_date || q.created_at,
                          data: q,
                        })),
                        ...followups.map((f) => ({
                          type: "followup",
                          date: f.followup_date,
                          data: f,
                        })),
                        ...services.map((s) => ({
                          type: "service",
                          date: s.start_date,
                          data: s,
                        })),
                      ]
                        .sort(
                          (a, b) =>
                            new Date(b.date).getTime() - new Date(a.date).getTime()
                        )
                        .map((activity, index) => {
                          if (!activity.date) return null;

                          if (activity.type === "customer") {
                            return (
                              <div
                                key={`customer-${index}`}
                                className="flex items-start gap-4"
                              >
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 break-all">
                                  <User className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1 pb-4 border-b border-slate-200">
                                  <p className="text-sm font-medium text-slate-900">
                                    تم إنشاء العميل
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {new Date(activity.date).toLocaleString("en-GB")}
                                  </p>
                                </div>
                              </div>
                            );
                          }

                          if (activity.type === "meeting") {
                            const meeting = activity.data as Meeting;
                            return (
                              <div
                                key={`meeting-${meeting.id}`}
                                className="flex items-start gap-4"
                              >
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 pb-4 border-b border-slate-200">
                                  <p className="text-sm font-medium text-slate-900">
                                    اجتماع{" "}
                                    {MEETING_TYPE_LABELS[meeting.meeting_type] ||
                                      meeting.meeting_type}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {new Date(activity.date).toLocaleString("en-GB")}
                                  </p>
                                  {meeting.goal && (
                                    <p className="text-xs text-slate-600 mt-1">
                                      الهدف: {meeting.goal}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          if (activity.type === "quotation") {
                            const quotation = activity.data as Quotation;
                            return (
                              <div
                                key={`quotation-${quotation.id}`}
                                className="flex items-start gap-4"
                              >
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1 pb-4 border-b border-slate-200">
                                  <p className="text-sm font-medium text-slate-900">
                                    عرض سعر {quotation.quotation_no}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {new Date(activity.date).toLocaleString("en-GB")}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    القيمة: {quotation.amount.toLocaleString()} ريال
                                  </p>
                                </div>
                              </div>
                            );
                          }

                          if (activity.type === "followup") {
                            const followup = activity.data as Followup;
                            return (
                              <div
                                key={`followup-${followup.id}`}
                                className="flex items-start gap-4"
                              >
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Target className="w-5 h-5 text-orange-600" />
                                </div>
                                <div className="flex-1 pb-4 border-b border-slate-200">
                                  <p className="text-sm font-medium text-slate-900 whitespace-pre-wrap break-all">
                                    متابعة عبر{" "}
                                    {FOLLOWUP_METHOD_LABELS[followup.method] ||
                                      followup.method}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1 whitespace-pre-wrap break-all">
                                    {new Date(activity.date).toLocaleString("en-GB")}
                                  </p>
                                  {followup.notes && (
                                    <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap break-all">
                                      {followup.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          if (activity.type === "service") {
                            const service = activity.data as CustomerService;
                            return (
                              <div
                                key={`service-${service.id}`}
                                className="flex items-start gap-4"
                              >
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Package className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1 pb-4 border-b border-slate-200">
                                  <p className="text-sm font-medium text-slate-900">
                                    خدمة جديدة: {service.service_name}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {new Date(activity.date).toLocaleString("en-GB")}
                                  </p>
                                </div>
                              </div>
                            );
                          }

                          return null;
                        })}
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
        </Card>
      </div>

      {/* Meeting full report dialog */}
      <Dialog open={meetingDetailsOpen} onOpenChange={setMeetingDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الاجتماع</DialogTitle>
            <DialogDescription>عرض كافة تفاصيل الاجتماع المسجل</DialogDescription>
          </DialogHeader>
          {selectedMeeting ? (
            <div className="space-y-4 mt-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">التاريخ والوقت:</span>
                <span className="font-medium text-slate-900">
                  {new Date(selectedMeeting.meeting_date).toLocaleString("en-GB")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">نوع الاجتماع:</span>
                <span className="font-medium text-slate-900">
                  {MEETING_TYPE_LABELS[selectedMeeting.meeting_type] ||
                    selectedMeeting.meeting_type}
                </span>
              </div>
              {selectedMeeting.goal && (
                <div>
                  <p className="text-slate-500 mb-1">هدف الاجتماع:</p>
                  <p className="bg-slate-50 rounded-lg p-3 text-slate-900">
                    {selectedMeeting.goal}
                  </p>
                </div>
              )}
              {selectedMeeting.summary && (
                <div>
                  <p className="text-slate-500 mb-1">ملخص الاجتماع:</p>
                  <p className="bg-slate-50 rounded-lg p-3 text-slate-900 whitespace-pre-wrap">
                    {selectedMeeting.summary}
                  </p>
                </div>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMeetingDetailsOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting edit dialog */}
      <Dialog open={editMeetingOpen} onOpenChange={setEditMeetingOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <form onSubmit={handleUpdateMeeting}>
            <DialogHeader>
              <DialogTitle>تعديل الاجتماع</DialogTitle>
              <DialogDescription>قم بتحديث بيانات الاجتماع</DialogDescription>
            </DialogHeader>
            {meetingToEdit && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="meetingDateEdit">تاريخ ووقت الاجتماع</Label>
                  <Input
                    id="meetingDateEdit"
                    name="meetingDate"
                    type="datetime-local"
                    defaultValue={meetingToEdit.meeting_date?.slice(0, 16)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingTypeEdit">نوع الاجتماع</Label>
                  <Select
                    name="meetingType"
                    defaultValue={meetingToEdit.meeting_type || "in_person"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_person">وجاهي</SelectItem>
                      <SelectItem value="online">أونلاين</SelectItem>
                      <SelectItem value="phone">هاتفي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goalEdit">هدف الاجتماع</Label>
                  <Input
                    id="goalEdit"
                    name="goal"
                    defaultValue={meetingToEdit.goal || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="summaryEdit">ملخص الاجتماع</Label>
                  <Textarea
                    id="summaryEdit"
                    name="summary"
                    defaultValue={meetingToEdit.summary || ""}
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  "تحديث"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quotation full report dialog */}
      <Dialog open={quotationDetailsOpen} onOpenChange={setQuotationDetailsOpen}>
        <DialogContent className="sm:max-w-[520px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل عرض السعر</DialogTitle>
            <DialogDescription>
              عرض كافة تفاصيل العرض والخدمات المرتبطة
            </DialogDescription>
          </DialogHeader>
          {selectedQuotation ? (
            <div className="space-y-4 mt-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">رقم العرض:</span>
                <span className="font-medium text-slate-900">
                  {selectedQuotation.quotation_no}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">تاريخ الإرسال:</span>
                <span className="font-medium text-slate-900">
                  {selectedQuotation.send_date
                    ? new Date(
                        selectedQuotation.send_date
                      ).toLocaleDateString("en-GB")
                    : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">القيمة:</span>
                <span className="font-medium text-slate-900">
                  {selectedQuotation.amount.toLocaleString()}{" "}
                  {selectedQuotation.currency || "ريال"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">الحالة:</span>
                <Badge
                  variant={
                    selectedQuotation.status === "accepted"
                      ? "default"
                      : selectedQuotation.status === "rejected"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {QUOTATION_STATUS_LABELS[selectedQuotation.status] ||
                    selectedQuotation.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">صلاحية العرض:</span>
                <span className="font-medium text-slate-900">
                  {selectedQuotation.validity_date
                    ? new Date(
                        selectedQuotation.validity_date
                      ).toLocaleDateString("en-GB")
                    : "-"}
                </span>
              </div>
              {Array.isArray(selectedQuotation.services) &&
                selectedQuotation.services.length > 0 && (
                  <div>
                    <p className="text-slate-500 mb-2">الخدمات:</p>
                    <ul className="space-y-1">
                      {selectedQuotation.services.map((srv: string, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 bg-slate-50 p-2 rounded-md"
                        >
                          <ListChecks className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-900">{srv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuotationDetailsOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quotation edit dialog */}
      <Dialog open={editQuotationOpen} onOpenChange={setEditQuotationOpen}>
        <DialogContent className="sm:max-w-[520px]" dir="rtl">
          <form onSubmit={handleUpdateQuotation}>
            <DialogHeader>
              <DialogTitle>تعديل عرض السعر</DialogTitle>
              <DialogDescription>قم بتحديث بيانات العرض</DialogDescription>
            </DialogHeader>
            {quotationToEdit && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sendDateEdit">تاريخ الإرسال</Label>
                  <Input
                    id="sendDateEdit"
                    name="sendDate"
                    type="date"
                    defaultValue={
                      quotationToEdit.send_date
                        ? quotationToEdit.send_date.slice(0, 10)
                        : ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amountEdit">قيمة العرض (ريال)</Label>
                  <Input
                    id="amountEdit"
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={quotationToEdit.amount?.toString() || ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servicesEdit">الخدمات (سطر لكل خدمة)</Label>
                  <Textarea
                    id="servicesEdit"
                    name="services"
                    rows={4}
                    defaultValue={
                      Array.isArray(quotationToEdit.services)
                        ? (quotationToEdit.services as string[]).join("\n")
                        : ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validityDateEdit">صلاحية العرض</Label>
                  <Input
                    id="validityDateEdit"
                    name="validityDate"
                    type="date"
                    defaultValue={
                      quotationToEdit.validity_date
                        ? quotationToEdit.validity_date.slice(0, 10)
                        : ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statusEdit">الحالة</Label>
                  <Select name="status" defaultValue={quotationToEdit.status || "sent"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="sent">مرسل</SelectItem>
                      <SelectItem value="accepted">مقبول</SelectItem>
                      <SelectItem value="rejected">مرفوض</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  "تحديث"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Followup full report dialog */}
      <Dialog open={followupDetailsOpen} onOpenChange={setFollowupDetailsOpen}>
        <DialogContent className="sm:max-w-[520px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل المتابعة</DialogTitle>
            <DialogDescription>عرض كافة تفاصيل المتابعة</DialogDescription>
          </DialogHeader>
          {selectedFollowup ? (
            <div className="space-y-4 mt-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">التاريخ والوقت:</span>
                <span className="font-medium text-slate-900">
                  {new Date(selectedFollowup.followup_date).toLocaleString("en-GB")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">طريقة المتابعة:</span>
                <span className="font-medium text-slate-900">
                  {FOLLOWUP_METHOD_LABELS[selectedFollowup.method] ||
                    selectedFollowup.method}
                </span>
              </div>
              <div>
                <p className="text-slate-500 mb-1">الملاحظات:</p>
                <p className="bg-slate-50 rounded-lg p-3 text-slate-900 whitespace-pre-wrap break-all">
                  {selectedFollowup.notes}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">المتابعة القادمة:</span>
                <span className="font-medium text-slate-900">
                  {selectedFollowup.next_followup
                    ? new Date(
                        selectedFollowup.next_followup
                      ).toLocaleString("en-GB")
                    : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">الحالة:</span>
                <span className="font-medium text-slate-900">
                  {selectedFollowup.is_done ? "تمت" : "لم تتم"}
                </span>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowupDetailsOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Followup edit dialog */}
      <Dialog open={editFollowupOpen} onOpenChange={setEditFollowupOpen}>
        <DialogContent className="sm:max-w-[520px]" dir="rtl">
          <form onSubmit={handleUpdateFollowup}>
            <DialogHeader>
              <DialogTitle>تعديل المتابعة</DialogTitle>
              <DialogDescription>قم بتحديث بيانات المتابعة</DialogDescription>
            </DialogHeader>
            {followupToEdit && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="followupDateEdit">تاريخ ووقت المتابعة</Label>
                  <Input
                    id="followupDateEdit"
                    name="followupDate"
                    type="datetime-local"
                    defaultValue={followupToEdit.followup_date.slice(0, 16)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="methodEdit">طريقة المتابعة</Label>
                  <Select name="method" defaultValue={followupToEdit.method}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">اتصال</SelectItem>
                      <SelectItem value="whatsapp">واتساب</SelectItem>
                      <SelectItem value="email">إيميل</SelectItem>
                      <SelectItem value="meeting">اجتماع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notesEdit">الملاحظات</Label>
                  <Textarea
                    id="notesEdit"
                    name="notes"
                    rows={4}
                    defaultValue={followupToEdit.notes || ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextFollowupEdit">المتابعة القادمة</Label>
                  <Input
                    id="nextFollowupEdit"
                    name="nextFollowup"
                    type="datetime-local"
                    defaultValue={
                      followupToEdit.next_followup
                        ? followupToEdit.next_followup.slice(0, 16)
                        : ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isDone">الحالة</Label>
                  <Select
                    name="isDone"
                    defaultValue={followupToEdit.is_done ? "true" : "false"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">لم تتم</SelectItem>
                      <SelectItem value="true">تمت</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  "تحديث"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Service full report dialog */}
      <Dialog open={serviceDetailsOpen} onOpenChange={setServiceDetailsOpen}>
        <DialogContent className="sm:max-w-[520px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الخدمة</DialogTitle>
            <DialogDescription>عرض كافة تفاصيل الخدمة</DialogDescription>
          </DialogHeader>
          {selectedService ? (
            <div className="space-y-4 mt-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">اسم الخدمة:</span>
                <span className="font-medium text-slate-900">
                  {selectedService.service_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">الحالة:</span>
                <Badge
                  variant={
                    selectedService.status === "active"
                      ? "default"
                      : selectedService.status === "completed"
                      ? "outline"
                      : "destructive"
                  }
                >
                  {selectedService.status === "active"
                    ? "جاري"
                    : selectedService.status === "completed"
                    ? "مكتمل"
                    : "متوقف"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">تاريخ البداية:</span>
                <span className="font-medium text-slate-900">
                  {new Date(selectedService.start_date).toLocaleDateString("en-GB")}
                </span>
              </div>
              <div>
                <p className="text-slate-500 mb-1">الملاحظات:</p>
                <p className="bg-slate-50 rounded-lg p-3 text-slate-900 whitespace-pre-wrap break-all">
                  {selectedService.notes || "-"}
                </p>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceDetailsOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service edit dialog */}
      <Dialog open={editServiceOpen} onOpenChange={setEditServiceOpen}>
        <DialogContent className="sm:max-w-[520px]" dir="rtl">
          <form onSubmit={handleUpdateService}>
            <DialogHeader>
              <DialogTitle>تعديل الخدمة</DialogTitle>
              <DialogDescription>قم بتحديث بيانات الخدمة</DialogDescription>
            </DialogHeader>
            {serviceToEdit && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceNameEdit">اسم الخدمة</Label>
                  <Input
                    id="serviceNameEdit"
                    name="serviceName"
                    defaultValue={serviceToEdit.service_name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDateEdit">تاريخ البداية</Label>
                  <Input
                    id="startDateEdit"
                    name="startDate"
                    type="date"
                    defaultValue={serviceToEdit.start_date.slice(0, 10)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statusEditService">الحالة</Label>
                  <Select
                    name="status"
                    defaultValue={serviceToEdit.status || "active"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">جاري</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="paused">متوقف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notesEditService">الملاحظات</Label>
                  <Textarea
                    id="notesEditService"
                    name="notes"
                    rows={3}
                    defaultValue={serviceToEdit.notes || ""}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  "تحديث"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
