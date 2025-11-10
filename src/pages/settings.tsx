import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import {
  UserPlus,
  Loader2,
  Mail,
  Phone,
  Shield,
  Eye,
  Edit as EditIcon,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  // add user form
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addRole, setAddRole] = useState<"admin" | "employee" | "sales">("employee");
  const [addIsActive, setAddIsActive] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addMessage, setAddMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // view
  const [viewUser, setViewUser] = useState<UserRow | null>(null);

  // edit
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "employee" | "sales">("employee");
  const [editIsActive, setEditIsActive] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    setAddMessage(null);

    if (!addName || !addEmail) {
      setAddMessage({ type: "error", text: "الرجاء إدخال الاسم والبريد الإلكتروني." });
      return;
    }

    try {
      setAdding(true);

      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            name: addName,
            email: addEmail,
            phone: addPhone || null,
            role: addRole,
            is_active: addIsActive,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setUsers((prev) => [data as UserRow, ...prev]);
      setAddMessage({ type: "success", text: "تم إضافة المستخدم بنجاح." });

      // reset
      setAddName("");
      setAddEmail("");
      setAddPhone("");
      setAddRole("employee");
      setAddIsActive(true);
    } catch (err: any) {
      console.error(err);
      setAddMessage({
        type: "error",
        text: err?.message || "حدث خطأ أثناء إضافة المستخدم.",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteUser = async (id: string, role: string | null) => {
    const sure = window.confirm("هل أنت متأكد من حذف هذا المستخدم؟");
    if (!sure) return;

    // optional: protect admins
    if (role === "admin") {
      alert("لا يمكن حذف مستخدم بصلاحية مدير.");
      return;
    }

    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("فشل حذف المستخدم");
    }
  };

  const openEditDialog = (user: UserRow) => {
    setEditUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditPhone(user.phone || "");
    setEditRole((user.role as "admin" | "employee" | "sales") || "employee");
    setEditIsActive(user.is_active ?? true);
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;
    try {
      setUpdating(true);
      const { data, error } = await supabase
        .from("users")
        .update({
          name: editName,
          email: editEmail,
          phone: editPhone || null,
          role: editRole,
          is_active: editIsActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editUser.id)
        .select()
        .single();

      if (error) throw error;

      // update UI
      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? (data as UserRow) : u))
      );

      setEditUser(null);
    } catch (err) {
      console.error(err);
      alert("فشل تحديث المستخدم");
    } finally {
      setUpdating(false);
    }
  };

  const roleBadge = (role: string | null) => {
    const r = role || "employee";
    const label = r === "admin" ? "مدير" : r === "sales" ? "مبيعات" : "موظف";
    const cls =
      r === "admin"
        ? "bg-purple-100 text-purple-700"
        : r === "sales"
        ? "bg-blue-100 text-blue-700"
        : "bg-slate-100 text-slate-700";
    return (
      <Badge className={`gap-1 ${cls}`}>
        <Shield className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* header */}
        <div className="flex items-center gap-3 mt-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">إدارة المستخدمين</h1>
            <p className="text-slate-500 text-sm">
              إضافة وتعديل وحذف المستخدمين من جدول <code>users</code>
            </p>
          </div>
        </div>

        {/* add user */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">إضافة مستخدم جديد</CardTitle>
            <CardDescription>املأ البيانات التالية لإضافة مستخدم.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4" dir="rtl">
            <div className="space-y-2 md:col-span-1">
              <Label>الاسم</Label>
              <Input value={addName} onChange={(e) => setAddName(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>رقم الجوال</Label>
              <Input value={addPhone} onChange={(e) => setAddPhone(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>الصلاحية</Label>
              <select
                value={addRole}
                onChange={(e) => setAddRole(e.target.value as any)}
                className="border border-slate-200 rounded-md px-3 py-2 text-sm w-full bg-white"
              >
                <option value="employee">موظف</option>
                <option value="sales">مبيعات</option>
                <option value="admin">مدير</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label className="block mb-1">حالة الحساب</Label>
              <div className="flex items-center gap-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={addIsActive}
                  onChange={(e) => setAddIsActive(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="active" className="text-sm">
                  نشط
                </Label>
              </div>
            </div>
            <div className="md:col-span-5">
              {addMessage && (
                <p
                  className={
                    addMessage.type === "success"
                      ? "text-sm text-green-600 mb-2"
                      : "text-sm text-red-600 mb-2"
                  }
                >
                  {addMessage.text}
                </p>
              )}
              <Button
                onClick={handleAddUser}
                disabled={adding}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {adding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 ml-2" />
                    إضافة
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* users table */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">قائمة المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">البريد</TableHead>
                      <TableHead className="text-right">الهاتف</TableHead>
                      <TableHead className="text-right">الصلاحية</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                          لا يوجد مستخدمون
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{user.name || "—"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Mail className="w-4 h-4" />
                              {user.email || "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone className="w-4 h-4" />
                              {user.phone || "—"}
                            </div>
                          </TableCell>
                          <TableCell>{roleBadge(user.role)}</TableCell>
                          <TableCell>
                            {user.is_active ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                نشط
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-600 border-slate-200">
                                غير نشط
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString("en-GB")
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => setViewUser(user)}
                              >
                                <Eye className="w-4 h-4" />
                                عرض
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => openEditDialog(user)}
                              >
                                <EditIcon className="w-4 h-4" />
                                تعديل
                              </Button>
                              {user.role !== "admin" && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleDeleteUser(user.id, user.role)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  حذف
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* view dialog */}
      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>بيانات المستخدم</DialogTitle>
            <DialogDescription>عرض تفاصيل المستخدم من جدول users.</DialogDescription>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-500">الاسم:</span>{" "}
                <span className="font-medium">{viewUser.name || "—"}</span>
              </p>
              <p>
                <span className="text-slate-500">البريد:</span>{" "}
                <span className="font-medium">{viewUser.email || "—"}</span>
              </p>
              <p>
                <span className="text-slate-500">الهاتف:</span>{" "}
                <span className="font-medium">{viewUser.phone || "—"}</span>
              </p>
              <p>
                <span className="text-slate-500">الصلاحية:</span>{" "}
                {roleBadge(viewUser.role)}
              </p>
              <p>
                <span className="text-slate-500">الحالة:</span>{" "}
                {viewUser.is_active ? "نشط" : "غير نشط"}
              </p>
              <p>
                <span className="text-slate-500">تاريخ الإنشاء:</span>{" "}
                {viewUser.created_at
                  ? new Date(viewUser.created_at).toLocaleString("en-GB")
                  : "—"}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewUser(null)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* edit dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
            <DialogDescription>تعديل بيانات المستخدم في جدول users.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>الاسم</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>رقم الجوال</Label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>
            <div>
              <Label>الصلاحية</Label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as any)}
                className="border border-slate-200 rounded-md px-3 py-2 text-sm w-full bg-white"
              >
                <option value="employee">موظف</option>
                <option value="sales">مبيعات</option>
                <option value="admin">مدير</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="edit-active"
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="edit-active" className="text-sm">
                نشط
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              إلغاء
            </Button>
            <Button onClick={handleUpdateUser} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
