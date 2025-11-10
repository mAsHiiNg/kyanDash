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
  Users,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Eye,
  Search,
  Package,
  DollarSign,
  MessageCircle,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { customersService } from "@/services/customersService";
import { servicesService } from "@/services/servicesService";
import type { Customer, CustomerService } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function ActiveClientsPage() {
  const [activeClients, setActiveClients] = useState<Customer[]>([]);
  const [customerServices, setCustomerServices] = useState<CustomerService[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [customers, services] = await Promise.all([
        customersService.getAllCustomers(),
        servicesService.getAllCustomerServices()
      ]);
      
      const active = customers.filter((c) => c.status === "active_client");
      setActiveClients(active);
      setCustomerServices(services);
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

  const getClientServices = (customerId: string) => {
    return customerServices.filter(
      (s) => s.customer_id === customerId && s.status === "active"
    );
  };

  const getActiveServicesCount = () => {
    return customerServices.filter((s) => s.status === "active").length;
  };

  const getCompletedServicesCount = () => {
    return customerServices.filter((s) => s.status === "completed").length;
  };

  const filteredClients = activeClients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.business_type && client.business_type.toLowerCase().includes(searchLower))
    );
  });

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              العملاء الفعليين
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              إدارة ومتابعة العملاء النشطين والخدمات المقدمة لهم
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">
                    إجمالي العملاء
                  </p>
                  <p className="text-3xl font-bold">{activeClients.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">
                    الخدمات النشطة
                  </p>
                  <p className="text-3xl font-bold">{getActiveServicesCount()}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">
                    الخدمات المكتملة
                  </p>
                  <p className="text-3xl font-bold">{getCompletedServicesCount()}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">
                    معدل الاحتفاظ
                  </p>
                  <p className="text-3xl font-bold">95%</p>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ابحث عن عميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              قائمة العملاء الفعليين
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? "لا توجد نتائج للبحث"
                    : "لا يوجد عملاء فعليين بعد"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العميل</TableHead>
                      <TableHead>معلومات الاتصال</TableHead>
                      <TableHead>الموقع</TableHead>
                      <TableHead>النشاط</TableHead>
                      <TableHead>الخدمات النشطة</TableHead>
                      <TableHead>الموظف المسؤول</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => {
                      const clientServices = getClientServices(client.id);
                      return (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {client.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  منذ{" "}
                                  {new Date(client.created_at).toLocaleDateString(
                                    "en-GB"
                                  )}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {client.phone}
                                </span>
                                <a
                                  href={`https://wa.me/${client.phone.replace(
                                    /[^0-9]/g,
                                    ""
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-700 dark:text-green-400"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </a>
                              </div>
                              {client.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {client.email}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {client.city && (
                              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {client.city}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {client.business_type && (
                              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <Briefcase className="w-3 h-3 text-gray-400" />
                                {client.business_type}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="gap-1 bg-green-500/10 text-green-700 dark:text-green-400"
                            >
                              <Package className="w-3 h-3" />
                              {clientServices.length}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {client.assigned_user?.name || "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Link href={`/customers/${client.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                عرض
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
