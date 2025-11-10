import { useState, useEffect } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  DollarSign,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { quotationsService } from "@/services/quotationsService";
import { QUOTATION_STATUS_LABELS } from "@/lib/constants";
import type { Database } from "@/integrations/supabase/types";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";


type Quotation = Database["public"]["Tables"]["quotations"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];

// we get quotation with customer from service
type QuotationWithCustomer = Quotation & {
  customer: Customer | null;
};

export default function QuotationsPage() {
  useAuthRedirect();

  const [quotations, setQuotations] = useState<QuotationWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // dialogs
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationWithCustomer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // edit form state
  const [editForm, setEditForm] = useState<{
    send_date: string;
    amount: string;
    currency: string;
    validity_date: string;
    status: string;
    services: string;
  }>({
    send_date: "",
    amount: "",
    currency: "OMR",
    validity_date: "",
    status: "sent",
    services: "",
  });

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const data = await quotationsService.getAllQuotations();
      setQuotations(data as QuotationWithCustomer[]);
    } catch (error) {
      console.error("Error loading quotations:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل العروض",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = quotations.filter(
    (q) =>
      q.quotation_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: quotations.length,
    sent: quotations.filter((q) => q.status === "sent").length,
    accepted: quotations.filter((q) => q.status === "accepted").length,
    rejected: quotations.filter((q) => q.status === "rejected").length,
    totalValue: quotations.reduce((sum, q) => sum + (q.amount || 0), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "sent":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const openView = (q: QuotationWithCustomer) => {
    setSelectedQuotation(q);
    setViewOpen(true);
  };

  const openEdit = (q: QuotationWithCustomer) => {
    setSelectedQuotation(q);
    setEditForm({
      send_date: q.send_date ? q.send_date.slice(0, 10) : "",
      amount: q.amount ? String(q.amount) : "",
      currency: q.currency || "OMR",
      validity_date: q.validity_date ? q.validity_date.slice(0, 10) : "",
      status: q.status,
      services: Array.isArray(q.services) ? q.services.join("\n") : "",
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedQuotation) return;
    try {
      const servicesArray = editForm.services
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      await quotationsService.updateQuotation(selectedQuotation.id, {
        send_date: editForm.send_date || null,
        amount: editForm.amount ? parseFloat(editForm.amount) : 0,
        currency: editForm.currency,
        validity_date: editForm.validity_date || null,
        status: editForm.status,
        services: servicesArray,
      });

      // update ui
      setQuotations((prev) =>
        prev.map((q) =>
          q.id === selectedQuotation.id
            ? {
                ...q,
                send_date: editForm.send_date || null,
                amount: editForm.amount ? parseFloat(editForm.amount) : 0,
                currency: editForm.currency,
                validity_date: editForm.validity_date || null,
                status: editForm.status,
                services: servicesArray,
              }
            : q
        )
      );

      toast({
        title: "تم التحديث",
        description: "تم تعديل عرض السعر بنجاح",
      });
      setEditOpen(false);
    } catch (error) {
      console.error("Error updating quotation:", error);
      toast({
        title: "خطأ",
        description: "تعذر تعديل عرض السعر",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("هل أنت متأكد من حذف هذا العرض؟");
    if (!confirmDelete) return;
    try {
      setDeletingId(id);
      await quotationsService.deleteQuotation(id);
      setQuotations((prev) => prev.filter((q) => q.id !== id));
      toast({
        title: "تم الحذف",
        description: "تم حذف عرض السعر بنجاح",
      });
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast({
        title: "خطأ",
        description: "تعذر حذف عرض السعر",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // simple download: you can change this to your real endpoint
  const handleDownload = (quotation: QuotationWithCustomer) => {
    // if you have an API route in your app:
    // window.open(`/api/quotations/${quotation.id}/pdf`, "_blank");
    // for now just show message
    toast({
      title: "تنزيل",
      description: "هنا تربط زر التنزيل بنقطة النهاية الخاصة بك (PDF).",
    });
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
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-sm text-slate-500">إجمالي العروض</p>
                </div>
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.sent}</p>
                  <p className="text-sm text-blue-100">تم الإرسال</p>
                </div>
                <Clock className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.accepted}</p>
                  <p className="text-sm text-green-100">مقبول</p>
                </div>
                <CheckCircle className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                  <p className="text-sm text-red-100">مرفوض</p>
                </div>
                <XCircle className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-xl font-bold">
                    {stats.totalValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-100">القيمة الإجمالية (ر.ع)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-900">
                عروض الأسعار
              </CardTitle>
              {/* go to customers to create */}
              <Link href="/customers">
                <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="w-4 h-4" />
                  إنشاء عرض سعر جديد
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="ابحث برقم العرض أو اسم العميل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-right font-bold">رقم العرض</TableHead>
                    <TableHead className="text-right font-bold">العميل</TableHead>
                    <TableHead className="text-right font-bold">تاريخ الإرسال</TableHead>
                    <TableHead className="text-right font-bold">القيمة</TableHead>
                    <TableHead className="text-right font-bold">الخدمات</TableHead>
                    <TableHead className="text-right font-bold">صلاحية العرض</TableHead>
                    <TableHead className="text-right font-bold">الحالة</TableHead>
                    <TableHead className="text-center font-bold">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        لا توجد عروض أسعار
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQuotations.map((quotation) => (
                      <TableRow
                        key={quotation.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <TableCell className="font-semibold text-blue-600">
                          {quotation.quotation_no}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/customers/${quotation.customer_id}`}
                            className="font-medium text-slate-900 hover:text-blue-600 hover:underline"
                          >
                            {quotation.customer?.name ||
                              `عميل #${quotation.customer_id.slice(0, 8)}`}
                          </Link>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {quotation.send_date
                            ? new Date(quotation.send_date).toLocaleDateString("en-GB")
                            : "-"}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900">
                          {(quotation.amount || 0).toLocaleString()}{" "}
                          {quotation.currency || "OMR"}
                        </TableCell>
                        <TableCell className="text-slate-600 whitespace-pre-wrap break-all">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(quotation.services) &&
                              quotation.services.slice(0, 2).map((service, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            {Array.isArray(quotation.services) &&
                              quotation.services.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{quotation.services.length - 2}
                                </Badge>
                              )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {quotation.validity_date
                            ? new Date(quotation.validity_date).toLocaleDateString("en-GB")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(quotation.status)}
                          >
                            {QUOTATION_STATUS_LABELS[
                              quotation.status as keyof typeof QUOTATION_STATUS_LABELS
                            ] || quotation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-slate-100"
                              onClick={() => openView(quotation)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-slate-100"
                              onClick={() => openEdit(quotation)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-green-50 hover:text-green-600"
                              onClick={() => handleDownload(quotation)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(quotation.id)}
                              disabled={deletingId === quotation.id}
                            >
                              {deletingId === quotation.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VIEW DIALOG */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[520px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل عرض السعر</DialogTitle>
            <DialogDescription>عرض كافة تفاصيل العرض والخدمات المرتبطة</DialogDescription>
          </DialogHeader>
          {selectedQuotation && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">رقم العرض:</span>
                <span className="font-medium text-slate-900">
                  {selectedQuotation.quotation_no}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">العميل:</span>
                <span className="font-medium text-slate-900">
                  {selectedQuotation.customer?.name || "غير محدد"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">تاريخ الإرسال:</span>
                <span className="font-medium text-slate-900">
                  {selectedQuotation.send_date
                    ? new Date(selectedQuotation.send_date).toLocaleDateString("en-GB")
                    : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">القيمة:</span>
                <span className="font-medium text-slate-900">
                  {selectedQuotation.amount.toLocaleString()}{" "}
                  {selectedQuotation.currency || "OMR"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">صلاحية العرض:</span>
                <span className="font-medium text-slate-900">
                  {selectedQuotation.validity_date
                    ? new Date(selectedQuotation.validity_date).toLocaleDateString("en-GB")
                    : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">الحالة:</span>
                <Badge
                  variant="outline"
                  className={getStatusColor(selectedQuotation.status)}
                >
                  {QUOTATION_STATUS_LABELS[
                    selectedQuotation.status as keyof typeof QUOTATION_STATUS_LABELS
                  ] || selectedQuotation.status}
                </Badge>
              </div>
              {Array.isArray(selectedQuotation.services) &&
                selectedQuotation.services.length > 0 && (
                  <div>
                    <p className="text-slate-500 mb-2">الخدمات:</p>
                    <ul className="space-y-1">
                      {selectedQuotation.services.map((srv, idx) => (
                        <li
                          key={idx}
                          className="bg-slate-50 rounded-md px-3 py-2 text-slate-900 whitespace-pre-wrap break-all"
                        >
                          {srv}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[520px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل عرض السعر</DialogTitle>
            <DialogDescription>يمكنك تعديل تفاصيل العرض هنا</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="send_date">تاريخ الإرسال</Label>
              <Input
                id="send_date"
                type="date"
                value={editForm.send_date}
                onChange={(e) => setEditForm((p) => ({ ...p, send_date: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="amount">القيمة</Label>
                <Input
                  id="amount"
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">العملة</Label>
                <Input
                  id="currency"
                  value={editForm.currency}
                  onChange={(e) => setEditForm((p) => ({ ...p, currency: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="validity_date">صلاحية العرض</Label>
              <Input
                id="validity_date"
                type="date"
                value={editForm.validity_date}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, validity_date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm((p) => ({ ...p, status: value }))}
              >
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
            <div className="space-y-2">
              <Label htmlFor="services">الخدمات (سطر لكل خدمة)</Label>
              <Textarea
                id="services"
                rows={4}
                value={editForm.services}
                onChange={(e) => setEditForm((p) => ({ ...p, services: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleEditSave}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
