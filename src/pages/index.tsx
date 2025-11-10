import { useState, useEffect } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  TrendingUp,
  Activity,
  Video,
  DollarSign
} from "lucide-react";
import { customersService } from "@/services/customersService";
import { followupsService } from "@/services/followupsService";
import { meetingsService } from "@/services/meetingsService";
import { quotationsService } from "@/services/quotationsService";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
export default function DashboardPage() {
  useAuthRedirect();

  const [stats, setStats] = useState({
    totalCustomers: 0,
    newToday: 0,
    quotationsSent: 0,
    activeClients: 0,
    followupsToday: 0,
    statusDistribution: {} as Record<string, number>
  });
  const [todayFollowups, setTodayFollowups] = useState<any[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        dashboardStats, 
        followupsData, 
        meetingsData,
        quotationsData
      ] = await Promise.all([
        customersService.getDashboardStats(),
        followupsService.getTodayFollowups(),
        meetingsService.getAllMeetings(),
        quotationsService.getAllQuotations()
      ]);

      setStats(dashboardStats);
      setTodayFollowups(followupsData.slice(0, 5));
      
      const upcoming = meetingsData
        .filter(m => new Date(m.meeting_date) > new Date())
        .sort((a, b) => new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime())
        .slice(0, 3);
      setUpcomingMeetings(upcoming);

      const activities = [
        ...quotationsData.slice(0, 2).map(q => ({
          type: "quotation",
          title: `عرض سعر جديد`,
          description: `تم إرسال عرض بقيمة ${q.amount} ${q.currency}`,
          customer: q.customer?.name,
          time: q.send_date,
          icon: FileText,
          color: "purple"
        })),
        ...meetingsData.slice(0, 2).map(m => ({
          type: "meeting",
          title: "اجتماع جديد",
          description: `اجتماع ${m.meeting_type === "online" ? "أونلاين" : "وجاهي"}`,
          customer: m.customer?.name,
          time: m.meeting_date,
          icon: Video,
          color: "blue"
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
      
      setRecentActivities(activities);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `منذ ${diffInDays} يوم`;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">جاري تحميل البيانات...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            لوحة التحكم
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            نظرة عامة على أداء نظام إدارة العملاء
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 opacity-70" />
              </div>
              <p className="text-3xl font-bold mb-1">{stats.totalCustomers}</p>
              <p className="text-sm opacity-90">إجمالي العملاء</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6" />
                </div>
                <Activity className="w-5 h-5 opacity-70" />
              </div>
              <p className="text-3xl font-bold mb-1">{stats.newToday}</p>
              <p className="text-sm opacity-90">عملاء جدد اليوم</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <DollarSign className="w-5 h-5 opacity-70" />
              </div>
              <p className="text-3xl font-bold mb-1">{stats.quotationsSent}</p>
              <p className="text-sm opacity-90">عروض مرسلة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 opacity-70" />
              </div>
              <p className="text-3xl font-bold mb-1">{stats.activeClients}</p>
              <p className="text-sm opacity-90">عملاء فعليين</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <AlertCircle className="w-5 h-5 opacity-70" />
              </div>
              <p className="text-3xl font-bold mb-1">{stats.followupsToday}</p>
              <p className="text-sm opacity-90">متابعات اليوم</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    المتابعات المقررة اليوم
                  </CardTitle>
                  <Badge variant="destructive">{stats.followupsToday}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {todayFollowups.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">لا توجد متابعات مقررة اليوم</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayFollowups.map((followup) => (
                      <div
                        key={followup.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                            {new Date(followup.followup_date).getHours()}:00
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {followup.customer?.name || "عميل"}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {followup.notes || "متابعة"}
                            </p>
                            <Badge variant="outline" className="mt-2">
                              {followup.method === "call" ? "اتصال" : followup.method === "whatsapp" ? "واتساب" : "بريد"}
                            </Badge>
                          </div>
                        </div>
                        <Link href={`/customers/${followup.customer_id}`}>
                          <Button size="sm" className="gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                            <Phone className="w-4 h-4" />
                            عرض
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/followups">
                  <Button variant="outline" className="w-full mt-4">
                    عرض جميع المتابعات
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  الاجتماعات القادمة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {upcomingMeetings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">لا توجد اجتماعات قادمة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingMeetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {meeting.customer?.name || "عميل"}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {new Date(meeting.meeting_date).toLocaleDateString("en-GB")} - {new Date(meeting.meeting_date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            <Badge variant="outline" className="mt-2">
                              {meeting.meeting_type === "online" ? "أونلاين" : meeting.meeting_type === "phone" ? "هاتفي" : "وجاهي"}
                            </Badge>
                          </div>
                        </div>
                        <Link href={`/customers/${meeting.customer_id}?tab=meetings`}>
                          <Button size="sm" variant="outline">
                            عرض
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/meetings">
                  <Button variant="outline" className="w-full mt-4">
                    عرض جميع الاجتماعات
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle>إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/customers/add">
                    <Button className="w-full h-24 flex-col gap-3 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md">
                      <UserPlus className="w-6 h-6" />
                      <span>إضافة عميل جديد</span>
                    </Button>
                  </Link>
                  <Link href="/quotations">
                    <Button className="w-full h-24 flex-col gap-3 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md">
                      <FileText className="w-6 h-6" />
                      <span>إنشاء عرض سعر</span>
                    </Button>
                  </Link>
                  <Link href="/followups">
                    <Button className="w-full h-24 flex-col gap-3 bg-gradient-to-br from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-md">
                      <Calendar className="w-6 h-6" />
                      <span>جدولة متابعة</span>
                    </Button>
                  </Link>
                  <Link href="/customers">
                    <Button className="w-full h-24 flex-col gap-3 bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-md">
                      <Users className="w-6 h-6" />
                      <span>عرض العملاء</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <CardTitle>توزيع العملاء</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {Object.entries(stats.statusDistribution).map(([status, count]) => {
                    const statusLabels: Record<string, string> = {
                      new_contact: "تواصل جديد",
                      appointment_set: "تحديد موعد",
                      quotation_sent: "إرسال عرض",
                      follow_up: "متابعة",
                      active_client: "عميل فعلي"
                    };

                    const statusColors: Record<string, string> = {
                      new_contact: "from-blue-500 to-blue-600",
                      appointment_set: "from-yellow-500 to-yellow-600",
                      quotation_sent: "from-purple-500 to-purple-600",
                      follow_up: "from-orange-500 to-orange-600",
                      active_client: "from-green-500 to-green-600"
                    };

                    const percentage = stats.totalCustomers > 0 
                      ? Math.round((count / stats.totalCustomers) * 100) 
                      : 0;

                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {statusLabels[status] || status}
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${statusColors[status]} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  آخر الأنشطة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">لا توجد أنشطة حديثة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => {
                      const Icon = activity.icon;
                      const colorClasses: Record<string, string> = {
                        purple: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
                        blue: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                      };
                      
                      return (
                        <div key={index} className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[activity.color]}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {activity.customer} - {activity.description}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {formatTime(activity.time)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}