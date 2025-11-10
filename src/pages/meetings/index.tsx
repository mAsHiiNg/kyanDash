import { useState, useEffect } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Video,
  Phone,
  Users,
  FileText,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { meetingsService } from "@/services/meetingsService";
import { customersService } from "@/services/customersService";
import type { Meeting, Customer } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const MEETING_TYPES = [
  { value: "in_person", label: "وجاهي", icon: Users },
  { value: "online", label: "أونلاين", icon: Video },
  { value: "phone", label: "هاتفي", icon: Phone },
];

export default function MeetingsPage() {
  useAuthRedirect();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // view dialog
  const [viewMeeting, setViewMeeting] = useState<Meeting | null>(null);

  // edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editMeeting, setEditMeeting] = useState<{
    id: string;
    customer_id: string;
    meeting_date: string;
    meeting_time: string;
    meeting_type: string;
    purpose: string;
    summary: string;
  } | null>(null);

  const { toast } = useToast();

  const [newMeeting, setNewMeeting] = useState({
    customer_id: "",
    meeting_date: "",
    meeting_time: "",
    meeting_type: "online",
    purpose: "",
    summary: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meetingsData, customersData] = await Promise.all([
        meetingsService.getAllMeetings(),
        customersService.getAllCustomers(),
      ]);
      setMeetings(meetingsData as Meeting[]);
      setCustomers(customersData);
    } catch (error) {
      console.error("خطأ في تحميل البيانات:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeeting = async () => {
    if (!newMeeting.customer_id || !newMeeting.meeting_date || !newMeeting.meeting_time) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      const meetingDateTime = `${newMeeting.meeting_date}T${newMeeting.meeting_time}:00`;

      await meetingsService.createMeeting({
        customer_id: newMeeting.customer_id,
        meeting_date: meetingDateTime,
        meeting_type: newMeeting.meeting_type,
        purpose: newMeeting.purpose,
        summary: newMeeting.summary,
      });

      toast({
        title: "نجح",
        description: "تم إضافة الاجتماع بنجاح",
      });

      setIsAddDialogOpen(false);
      setNewMeeting({
        customer_id: "",
        meeting_date: "",
        meeting_time: "",
        meeting_type: "online",
        purpose: "",
        summary: "",
      });
      loadData();
    } catch (error) {
      console.error("خطأ في إضافة الاجتماع:", error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة الاجتماع",
        variant: "destructive",
      });
    }
  };

  const getMeetingTypeLabel = (type: string) => {
    const meetingType = MEETING_TYPES.find((t) => t.value === type);
    return meetingType?.label || type;
  };

  const getMeetingTypeBadgeColor = (type: string) => {
    switch (type) {
      case "in_person":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "online":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "phone":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  // fix date to show 9 November 2025 in RTL by making it RTL
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const filteredMeetings = meetings.filter((meeting) => {
    const customerName = meeting.customer?.name || "";
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || meeting.meeting_type === filterType;

    let matchesDate = true;
    if (filterDate === "upcoming") {
      matchesDate = isUpcoming(meeting.meeting_date);
    } else if (filterDate === "past") {
      matchesDate = !isUpcoming(meeting.meeting_date);
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const upcomingMeetingsCount = meetings.filter((m) => isUpcoming(m.meeting_date)).length;

  const handleViewMeeting = (meeting: Meeting) => {
    setViewMeeting(meeting);
  };

  const handleOpenEdit = (meeting: Meeting) => {
    const d = new Date(meeting.meeting_date);
    const dateStr = d.toISOString().slice(0, 10);
    const timeStr = d.toISOString().slice(11, 16);

    setEditMeeting({
      id: meeting.id,
      customer_id: meeting.customer_id,
      meeting_date: dateStr,
      meeting_time: timeStr,
      meeting_type: meeting.meeting_type,
      purpose: meeting.purpose || "",
      summary: meeting.summary || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editMeeting) return;
    if (!editMeeting.customer_id || !editMeeting.meeting_date || !editMeeting.meeting_time) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      const meetingDateTime = `${editMeeting.meeting_date}T${editMeeting.meeting_time}:00`;

      // call API
      await meetingsService.updateMeeting(editMeeting.id, {
        customer_id: editMeeting.customer_id,
        meeting_date: meetingDateTime,
        meeting_type: editMeeting.meeting_type,
        purpose: editMeeting.purpose,
        summary: editMeeting.summary,
      });

      // ✅ rebuild from our local edit object so TS is happy
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === editMeeting.id
            ? {
                ...m,
                customer_id: editMeeting.customer_id,
                meeting_date: meetingDateTime,
                meeting_type: editMeeting.meeting_type as Meeting["meeting_type"],
                purpose: editMeeting.purpose,
                summary: editMeeting.summary,
              }
            : m
        )
      );

      toast({
        title: "تم التحديث",
        description: "تم تعديل بيانات الاجتماع",
      });

      setIsEditDialogOpen(false);
      setEditMeeting(null);
    } catch (error) {
      console.error("خطأ في تعديل الاجتماع:", error);
      toast({
        title: "خطأ",
        description: "فشل في تعديل الاجتماع",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    const ok = window.confirm("هل أنت متأكد من حذف هذا الاجتماع؟");
    if (!ok) return;

    try {
      await meetingsService.deleteMeeting(id);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      toast({
        title: "تم الحذف",
        description: "تم حذف الاجتماع بنجاح",
      });
    } catch (error) {
      console.error("خطأ في حذف الاجتماع:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الاجتماع",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الاجتماعات</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              إدارة جميع الاجتماعات والمكالمات مع العملاء
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                إضافة اجتماع
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>إضافة اجتماع جديد</DialogTitle>
                <DialogDescription>قم بإدخال تفاصيل الاجتماع مع العميل</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer">العميل *</Label>
                  <Select
                    value={newMeeting.customer_id}
                    onValueChange={(value) =>
                      setNewMeeting({ ...newMeeting, customer_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="meeting_date">التاريخ *</Label>
                    <Input
                      id="meeting_date"
                      type="date"
                      value={newMeeting.meeting_date}
                      onChange={(e) =>
                        setNewMeeting({ ...newMeeting, meeting_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="meeting_time">الوقت *</Label>
                    <Input
                      id="meeting_time"
                      type="time"
                      value={newMeeting.meeting_time}
                      onChange={(e) =>
                        setNewMeeting({ ...newMeeting, meeting_time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="meeting_type">نوع الاجتماع *</Label>
                  <Select
                    value={newMeeting.meeting_type}
                    onValueChange={(value) =>
                      setNewMeeting({ ...newMeeting, meeting_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEETING_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="purpose">الهدف من الاجتماع</Label>
                  <Input
                    id="purpose"
                    placeholder="مثال: مناقشة استراتيجية التسويق"
                    value={newMeeting.purpose}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, purpose: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="summary">ملخص الاجتماع</Label>
                  <Textarea
                    id="summary"
                    placeholder="ملخص مختصر عن الاجتماع..."
                    rows={3}
                    value={newMeeting.summary}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, summary: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddMeeting}>إضافة الاجتماع</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    إجمالي الاجتماعات
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {meetings.length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    اجتماعات قادمة
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {upcomingMeetingsCount}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    اجتماعات وجاهية
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {meetings.filter((m) => m.meeting_type === "in_person").length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    اجتماعات أونلاين
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {meetings.filter((m) => m.meeting_type === "online").length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Video className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>قائمة الاجتماعات</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="بحث عن عميل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 w-full sm:w-[200px]"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="نوع الاجتماع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأنواع</SelectItem>
                    {MEETING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="التاريخ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الاجتماعات</SelectItem>
                    <SelectItem value="upcoming">قادمة</SelectItem>
                    <SelectItem value="past">سابقة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-4 text-gray-500">جاري التحميل...</p>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || filterType !== "all" || filterDate !== "all"
                    ? "لا توجد نتائج للبحث"
                    : "لا توجد اجتماعات بعد"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto" dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* from right to left */}
                      <TableHead className="text-right">العميل</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الوقت</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الهدف</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMeetings.map((meeting) => (
                      <TableRow key={meeting.id}>
                        {/* العميل */}
                        <TableCell>
                          <Link
                            href={`/customers/${meeting.customer_id}`}
                            className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {meeting.customer?.name || "غير محدد"}
                          </Link>
                        </TableCell>

                        {/* التاريخ (نخليها LTR عشان ما تصير غريبة في العربي) */}
                        <TableCell>
                          <span dir="ltr">
                            {new Date(meeting.meeting_date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </TableCell>

                        {/* الوقت */}
                        <TableCell>
                          <span dir="ltr">
                            {new Date(meeting.meeting_date).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </TableCell>

                        {/* النوع */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={(() => {
                              switch (meeting.meeting_type) {
                                case "in_person":
                                  return "bg-green-500/10 text-green-700";
                                case "online":
                                  return "bg-blue-500/10 text-blue-700";
                                case "phone":
                                  return "bg-purple-500/10 text-purple-700";
                                default:
                                  return "bg-slate-100 text-slate-700";
                              }
                            })()}
                          >
                            {meeting.meeting_type === "in_person"
                              ? "وجاهي"
                              : meeting.meeting_type === "online"
                              ? "أونلاين"
                              : meeting.meeting_type === "phone"
                              ? "هاتفي"
                              : meeting.meeting_type}
                          </Badge>
                        </TableCell>

                        {/* الهدف */}
                        <TableCell className="max-w-xs truncate">
                          {meeting.purpose || "-"}
                        </TableCell>

                        {/* الحالة */}
                        <TableCell>
                          {new Date(meeting.meeting_date) > new Date() ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-700">
                              قادم
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-200 text-slate-700">
                              منتهي
                            </Badge>
                          )}
                        </TableCell>

                        {/* الإجراءات (آخر شي على اليسار) */}
                        <TableCell>
                          <div className="flex gap-1 justify-start">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewMeeting(meeting)}
                              title="عرض"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(meeting)}
                              title="تعديل"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMeeting(meeting.id)}
                              title="حذف"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Link href={`/customers/${meeting.customer_id}?tab=meetings`}>
                              <Button variant="ghost" size="sm">
                                تفاصيل العميل
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

            )}
          </CardContent>
        </Card>
      </div>

      {/* VIEW DIALOG */}
      <Dialog open={!!viewMeeting} onOpenChange={() => setViewMeeting(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تفاصيل الاجتماع</DialogTitle>
            <DialogDescription>عرض كافة تفاصيل الاجتماع</DialogDescription>
          </DialogHeader>
          {viewMeeting && (
            <div className="space-y-3 text-sm" dir="rtl">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">العميل:</span>
                <span className="font-medium">
                  {viewMeeting.customer?.name || "غير محدد"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">التاريخ والوقت:</span>
                <span className="font-medium" dir="RTL">
                  {new Date(viewMeeting.meeting_date).toLocaleString("en-GB")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">نوع الاجتماع:</span>
                <span className="font-medium">
                  {getMeetingTypeLabel(viewMeeting.meeting_type)}
                </span>
              </div>
              {viewMeeting.purpose && (
                <div>
                  <p className="text-muted-foreground mb-1">الهدف:</p>
                  <p className="bg-slate-50 rounded-lg p-2 text-slate-900 whitespace-pre-wrap">
                    {viewMeeting.purpose}
                  </p>
                </div>
              )}
              {viewMeeting.summary && (
                <div>
                  <p className="text-muted-foreground mb-1">الملخص:</p>
                  <p className="bg-slate-50 rounded-lg p-2 text-slate-900 whitespace-pre-wrap break-words">
                    {viewMeeting.summary}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewMeeting(null)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الاجتماع</DialogTitle>
            <DialogDescription>قم بتعديل بيانات الاجتماع</DialogDescription>
          </DialogHeader>
          {editMeeting && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer">العميل *</Label>
                <Select
                  value={editMeeting.customer_id}
                  onValueChange={(value) =>
                    setEditMeeting((prev) => (prev ? { ...prev, customer_id: value } : prev))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_meeting_date">التاريخ *</Label>
                  <Input
                    id="edit_meeting_date"
                    type="date"
                    value={editMeeting.meeting_date}
                    onChange={(e) =>
                      setEditMeeting((prev) =>
                        prev ? { ...prev, meeting_date: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_meeting_time">الوقت *</Label>
                  <Input
                    id="edit_meeting_time"
                    type="time"
                    value={editMeeting.meeting_time}
                    onChange={(e) =>
                      setEditMeeting((prev) =>
                        prev ? { ...prev, meeting_time: e.target.value } : prev
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_meeting_type">نوع الاجتماع *</Label>
                <Select
                  value={editMeeting.meeting_type}
                  onValueChange={(value) =>
                    setEditMeeting((prev) =>
                      prev ? { ...prev, meeting_type: value } : prev
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEETING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_purpose">الهدف من الاجتماع</Label>
                <Input
                  id="edit_purpose"
                  value={editMeeting.purpose}
                  onChange={(e) =>
                    setEditMeeting((prev) =>
                      prev ? { ...prev, purpose: e.target.value } : prev
                    )
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_summary">ملخص الاجتماع</Label>
                <Textarea
                  id="edit_summary"
                  rows={3}
                  value={editMeeting.summary}
                  onChange={(e) =>
                    setEditMeeting((prev) =>
                      prev ? { ...prev, summary: e.target.value } : prev
                    )
                  }
                  className="whitespace-pre-wrap"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveEdit}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
