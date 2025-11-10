import { useState, useEffect } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Target,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Loader2,
  CheckCircle2,
  Eye, // 👁️ added this
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { followupsService } from "@/services/followupsService";
import { FOLLOWUP_METHOD_LABELS } from "@/lib/constants";
import type { Database } from "@/integrations/supabase/types";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

type Followup = Database["public"]["Tables"]["followups"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];

type FollowupWithCustomer = Followup & {
  customer: Customer | null;
};

export default function FollowupsPage() {
  useAuthRedirect();

  const [followups, setFollowups] = useState<FollowupWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadFollowups();
  }, []);

  const loadFollowups = async () => {
    try {
      setLoading(true);
      const data = await followupsService.getAllFollowups();
      setFollowups(data as FollowupWithCustomer[]);
    } catch (error) {
      console.error("Error loading followups:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل المتابعات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDone = async (id: string) => {
    const current = followups.find((f) => f.id === id);
    if (!current) return;

    const nextIsDone = !current.is_done;

    setFollowups((prev) =>
      prev.map((f) => (f.id === id ? { ...f, is_done: nextIsDone } : f))
    );

    try {
      await followupsService.updateFollowup(id, {
        is_done: nextIsDone,
      });

      toast({
        title: "تم التحديث",
        description: `تم ${nextIsDone ? "" : "إلغاء "}تحديد المتابعة كمكتملة`,
      });
    } catch (error: any) {
      console.error("Error updating followup:", error);

      const msg = error?.message || "";
      if (msg.includes("activities_type_check")) {
        toast({
          title: "تم التحديث",
          description: "تم تحديث المتابعة لكن لم يتم تسجيلها في السجل الزمني.",
        });
        return;
      }

      setFollowups((prev) =>
        prev.map((f) => (f.id === id ? { ...f, is_done: current.is_done } : f))
      );

      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المتابعة",
        variant: "destructive",
      });
    }
  };

  const filteredFollowups = followups.filter((followup) => {
    const customerName = followup.customer?.name || "";
    const matchesSearch =
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (followup.notes || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "done" && followup.is_done) ||
      (filterStatus === "pending" && !followup.is_done);

    const matchesMethod =
      filterMethod === "all" || followup.method === filterMethod;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const isOverdue = (date: string, isDone: boolean) => {
    return new Date(date) < new Date() && !isDone;
  };

  const stats = {
    total: followups.length,
    today: followups.filter((f) => {
      const today = new Date().toDateString();
      return new Date(f.followup_date).toDateString() === today && !f.is_done;
    }).length,
    overdue: followups.filter((f) => isOverdue(f.followup_date, f.is_done)).length,
    done: followups.filter((f) => f.is_done).length,
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-sm text-slate-500">إجمالي المتابعات</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.overdue}</p>
                  <p className="text-sm text-red-100">متابعات متأخرة</p>
                </div>
                <AlertCircle className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.today}</p>
                  <p className="text-sm text-orange-100">متابعات اليوم</p>
                </div>
                <Clock className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.done}</p>
                  <p className="text-sm text-green-100">تم إنجازها</p>
                </div>
                <CheckCircle className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-900">
                مركز المتابعات
              </CardTitle>
              <Link href="/customers">
                <Button className="gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                  <Plus className="w-4 h-4" />
                  إضافة متابعة جديدة
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="ابحث في المتابعات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="done">تم الإنجاز</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="طريقة المتابعة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الطرق</SelectItem>
                  {Object.entries(FOLLOWUP_METHOD_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-right font-bold">العميل</TableHead>
                    <TableHead className="text-right font-bold">تاريخ المتابعة</TableHead>
                    <TableHead className="text-right font-bold">الطريقة</TableHead>
                    <TableHead className="text-right font-bold">الملاحظات</TableHead>
                    <TableHead className="text-right font-bold">المتابعة القادمة</TableHead>
                    <TableHead className="text-center font-bold">الحالة</TableHead>
                    <TableHead className="text-center font-bold">عرض</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredFollowups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        لا توجد متابعات
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFollowups.map((followup) => {
                      const overdue = isOverdue(followup.followup_date, followup.is_done);
                      const MethodIcon =
                        followup.method === "call"
                          ? Phone
                          : followup.method === "whatsapp"
                          ? MessageCircle
                          : followup.method === "email"
                          ? Mail
                          : Calendar;

                      return (
                        <TableRow key={followup.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell>
                            <Link
                              href={`/customers/${followup.customer_id}`}
                              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {followup.customer?.name || `عميل #${followup.customer_id.slice(0, 8)}`}
                            </Link>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={overdue ? "text-red-600 font-semibold" : "text-slate-700"}>
                                {new Date(followup.followup_date).toLocaleString("en-GB", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {overdue && (
                                <Badge variant="destructive" className="text-xs">
                                  متأخر
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MethodIcon className="w-4 h-4 text-slate-600" />
                              <span className="text-sm text-slate-600">
                                {FOLLOWUP_METHOD_LABELS[followup.method as keyof typeof FOLLOWUP_METHOD_LABELS] ||
                                  followup.method}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-slate-600 max-w-xs truncate">
                            {followup.notes || "-"}
                          </TableCell>

                          <TableCell className="text-slate-600">
                            {followup.next_followup
                              ? new Date(followup.next_followup).toLocaleDateString("en-GB")
                              : "-"}
                          </TableCell>

                          <TableCell className="text-center">
                            {followup.is_done ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                تم الإنجاز
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsDone(followup.id)}
                                className="gap-1 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                              >
                                <CheckCircle className="w-3 h-3" />
                                تحديد كمكتمل
                              </Button>
                            )}
                          </TableCell>

                          {/* 👁️ Eye button column */}
                          <TableCell className="text-center">
                            <Link href={`/customers/${followup.customer_id}`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                title="عرض تفاصيل العميل"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
