import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  Loader2,
  Download,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { customersService } from "@/services/customersService";
import { quotationsService } from "@/services/quotationsService";
import { followupsService } from "@/services/followupsService";
import { meetingsService } from "@/services/meetingsService";
import { CUSTOMER_SOURCE_LABELS } from "@/lib/constants";
import type { Customer, Quotation, Followup, Meeting } from "@/types";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
export default function ReportsPage() {
  useAuthRedirect();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("month");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [customersData, quotationsData, followupsData, meetingsData] = await Promise.all([
        customersService.getAllCustomers(),
        quotationsService.getAllQuotations(),
        followupsService.getAllFollowups(),
        meetingsService.getAllMeetings()
      ]);
      
      setCustomers(customersData);
      setQuotations(quotationsData as Quotation[]);
      setFollowups(followupsData as Followup[]);
      setMeetings(meetingsData as Meeting[]);
    } catch (error) {
      console.error("Error loading reports data:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل بيانات التقارير",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
    toast({
      title: "تم التحديث",
      description: "تم تحديث بيانات التقارير بنجاح"
    });
  };

  const handleExport = () => {
    toast({
      title: "جاري التصدير",
      description: "سيتم تصدير التقرير قريباً"
    });
  };

  const sourceStats = Object.keys(CUSTOMER_SOURCE_LABELS).map((source) => ({
    source: CUSTOMER_SOURCE_LABELS[source as keyof typeof CUSTOMER_SOURCE_LABELS],
    count: customers.filter((c) => c.source === source).length
  }));

  const statusStats = {
    new: customers.filter((c) => c.status === "new_contact").length,
    appointment: customers.filter((c) => c.status === "appointment_set").length,
    quotation: customers.filter((c) => c.status === "quotation_sent").length,
    followup: customers.filter((c) => c.status === "follow_up").length,
    active: customers.filter((c) => c.status === "active_client").length
  };

  const conversionRate = customers.length > 0
    ? ((statusStats.active / customers.length) * 100).toFixed(1)
    : "0";

  const acceptedQuotations = quotations.filter(q => q.status === "accepted");
  const totalRevenue = acceptedQuotations.reduce((sum, q) => sum + (q.amount || 0), 0);

  const completedFollowups = followups.filter(f => f.is_done);
  const followupCompletionRate = followups.length > 0
    ? ((completedFollowups.length / followups.length) * 100).toFixed(0)
    : "0";

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">التقارير والإحصاءات</h1>
            <p className="text-sm text-slate-500">عرض شامل لأداء النظام والعملاء</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-48 bg-white border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
                <SelectItem value="quarter">هذا الربع</SelectItem>
                <SelectItem value="year">هذا العام</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="icon"
              className="border-slate-300"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-4xl font-bold mb-2">{customers.length}</p>
              <p className="text-sm text-blue-100">إجمالي العملاء</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Target className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-4xl font-bold mb-2">{statusStats.active}</p>
              <p className="text-sm text-green-100">عملاء فعليين</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-4xl font-bold mb-2">{conversionRate}%</p>
              <p className="text-sm text-purple-100">نسبة التحويل</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <DollarSign className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-3xl font-bold mb-2">{totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-orange-100">إيرادات مقبولة (ر.س)</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sources Chart */}
          <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                مصادر العملاء
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {sourceStats.map((stat, idx) => {
                  const percentage = customers.length > 0
                    ? (stat.count / customers.length) * 100
                    : 0;

                  const colors = [
                    "from-blue-500 to-blue-600",
                    "from-purple-500 to-purple-600",
                    "from-green-500 to-green-600",
                    "from-orange-500 to-orange-600",
                    "from-pink-500 to-pink-600",
                    "from-indigo-500 to-indigo-600"
                  ];

                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{stat.source}</span>
                        <span className="text-slate-600 font-semibold">
                          {stat.count} عميل ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className={`bg-gradient-to-r ${colors[idx % colors.length]} h-3 rounded-full transition-all duration-700 ease-out shadow-sm`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Stages */}
          <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                مراحل العملاء (Pipeline)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all hover:scale-[1.02]">
                  <span className="text-sm font-semibold text-slate-700">تواصل جديد</span>
                  <span className="text-2xl font-bold text-blue-600">{statusStats.new}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all hover:scale-[1.02]">
                  <span className="text-sm font-semibold text-slate-700">تحديد موعد</span>
                  <span className="text-2xl font-bold text-purple-600">{statusStats.appointment}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 hover:shadow-md transition-all hover:scale-[1.02]">
                  <span className="text-sm font-semibold text-slate-700">إرسال عرض</span>
                  <span className="text-2xl font-bold text-indigo-600">{statusStats.quotation}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-md transition-all hover:scale-[1.02]">
                  <span className="text-sm font-semibold text-slate-700">متابعة</span>
                  <span className="text-2xl font-bold text-orange-600">{statusStats.followup}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all hover:scale-[1.02]">
                  <span className="text-sm font-semibold text-slate-700">عميل فعلي</span>
                  <span className="text-2xl font-bold text-green-600">{statusStats.active}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quotations Performance */}
          <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                أداء العروض
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                  <p className="text-sm text-slate-600 mb-2 font-medium">العروض المرسلة</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {quotations.filter(q => q.status === "sent").length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                  <p className="text-sm text-slate-600 mb-2 font-medium">العروض المقبولة</p>
                  <p className="text-4xl font-bold text-green-600">{acceptedQuotations.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 hover:shadow-md transition-shadow">
                  <p className="text-sm text-slate-600 mb-2 font-medium">العروض المرفوضة</p>
                  <p className="text-4xl font-bold text-red-600">
                    {quotations.filter(q => q.status === "rejected").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meetings Statistics */}
          <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                إحصائيات الاجتماعات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 hover:shadow-md transition-shadow">
                  <p className="text-sm text-slate-600 mb-2 font-medium">إجمالي الاجتماعات</p>
                  <p className="text-4xl font-bold text-indigo-600">{meetings.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                  <p className="text-sm text-slate-600 mb-2 font-medium">اجتماعات وجاهية</p>
                  <p className="text-4xl font-bold text-purple-600">
                    {meetings.filter(m => m.meeting_type === "in_person").length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                  <p className="text-sm text-slate-600 mb-2 font-medium">اجتماعات أونلاين</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {meetings.filter(m => m.meeting_type === "online").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Follow-ups Statistics */}
          <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                أداء المتابعات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                  <p className="text-sm text-slate-600 mb-2 font-medium">إجمالي المتابعات</p>
                  <p className="text-4xl font-bold text-slate-700">{followups.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                  <p className="text-sm text-slate-600 mb-2 font-medium">المتابعات المكتملة</p>
                  <p className="text-4xl font-bold text-green-600">{completedFollowups.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
                  <p className="text-sm text-slate-600 mb-2 font-medium">نسبة الإنجاز</p>
                  <p className="text-4xl font-bold text-orange-600">{followupCompletionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Summary */}
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-sm text-slate-600 mb-1">متوسط قيمة العرض</p>
                <p className="text-2xl font-bold text-slate-900">
                  {quotations.length > 0
                    ? (quotations.reduce((sum, q) => sum + (q.amount || 0), 0) / quotations.length).toLocaleString(undefined, { maximumFractionDigits: 0 })
                    : "0"} ر.س
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">معدل قبول العروض</p>
                <p className="text-2xl font-bold text-green-600">
                  {quotations.length > 0
                    ? ((acceptedQuotations.length / quotations.length) * 100).toFixed(0)
                    : "0"}%
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">متوسط المتابعات لكل عميل</p>
                <p className="text-2xl font-bold text-blue-600">
                  {customers.length > 0
                    ? (followups.length / customers.length).toFixed(1)
                    : "0"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">متوسط الاجتماعات</p>
                <p className="text-2xl font-bold text-purple-600">
                  {customers.length > 0
                    ? (meetings.length / customers.length).toFixed(1)
                    : "0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
