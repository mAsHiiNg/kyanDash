import { useState, useEffect } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  UserPlus,
  Search,
  Eye,
  Edit,
  Trash2,
  MessageCircle,
} from "lucide-react";
import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_SOURCE_LABELS,
} from "@/lib/constants";
import { customersService } from "@/services/customersService";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function CustomersPage() {
  useAuthRedirect();
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [customers, searchQuery, statusFilter, sourceFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customersService.getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
      alert("حدث خطأ أثناء تحميل العملاء");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...customers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.includes(searchQuery) ||
          (customer.email
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ?? false)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (customer) => customer.status === statusFilter
      );
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter(
        (customer) => customer.source === sourceFilter
      );
    }

    setFilteredCustomers(filtered);
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      try {
        await customersService.deleteCustomer(id);
        loadCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
        alert("حدث خطأ أثناء حذف العميل");
      }
    }
  };

  const stats = {
    total: customers.length,
    new: customers.filter((c) => c.status === "new_contact").length,
    active: customers.filter((c) => c.status === "active_client").length,
    followup: customers.filter((c) => c.status === "follow_up").length,
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">جاري تحميل العملاء...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.total}
                  </p>
                  <p className="text-sm text-slate-500">إجمالي العملاء</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.new}
                  </p>
                  <p className="text-sm text-slate-500">تواصل جديد</p>
                </div>
                <StatusBadge status="new_contact" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.active}
                  </p>
                  <p className="text-sm text-slate-500">عملاء فعليين</p>
                </div>
                <StatusBadge status="active_client" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.followup}
                  </p>
                  <p className="text-sm text-slate-500">يحتاج متابعة</p>
                </div>
                <StatusBadge status="follow_up" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-900">
                قائمة العملاء
              </CardTitle>
              <Link href="/customers/add">
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <UserPlus className="w-4 h-4" />
                  إضافة عميل جديد
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="ابحث عن عميل (الاسم، الجوال، البريد الإلكتروني)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  {Object.entries(CUSTOMER_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="جميع المصادر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المصادر</SelectItem>
                  {Object.entries(CUSTOMER_SOURCE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-right font-bold">الاسم</TableHead>
                    <TableHead className="text-right font-bold">
                      رقم الجوال
                    </TableHead>
                    <TableHead className="text-right font-bold">
                      المصدر
                    </TableHead>
                    <TableHead className="text-right font-bold">
                      الحالة
                    </TableHead>
                    <TableHead className="text-right font-bold">
                      نوع النشاط
                    </TableHead>
                    <TableHead className="text-center font-bold">
                      الإجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-slate-500"
                      >
                        لا توجد نتائج
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className="hover:bg-slate-50"
                      >
                        <TableCell className="font-semibold text-slate-900">
                          {customer.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700">
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
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">
                            {CUSTOMER_SOURCE_LABELS[customer.source]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={customer.status} />
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {customer.business_type || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/customers/${customer.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/customers/edit/${customer.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(customer.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Results Info */}
            <div className="mt-4 text-sm text-slate-600">
              عرض {filteredCustomers.length} من {customers.length} عميل
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
