
import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Target,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();

  const navItems = [
    {
      name: "لوحة التحكم",
      href: "/",
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: "العملاء",
      href: "/customers",
      icon: Users,
      badge: null
    },
    {
      name: "المتابعات",
      href: "/followups",
      icon: Target,
      badge: null
    },
    {
      name: "الاجتماعات",
      href: "/meetings",
      icon: Calendar,
      badge: null
    },
    {
      name: "العروض",
      href: "/quotations",
      icon: FileText,
      badge: null
    },
    {
      name: "التقارير",
      href: "/reports",
      icon: BarChart3,
      badge: null
    },
    {
      name: "الإعدادات",
      href: "/settings",
      icon: Settings,
      badge: null
    }
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return router.pathname === "/";
    }
    return router.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
      {/* Sidebar */}
      <aside className="fixed right-0 top-0 h-full w-64 bg-white border-l border-slate-200 shadow-lg z-40">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">نظام كيان</h2>
              <p className="text-xs text-slate-500">وكالة التسويق</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={active ? "secondary" : "destructive"}
                    className={cn(
                      "rounded-full px-2 min-w-[24px] h-6",
                      active && "bg-white text-blue-600"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
              م
            </div>
            <div className="flex-1">
              {/* <p className="text-sm font-semibold text-slate-900">محمد أحمد</p> */}
              <p className="text-xs text-slate-500">مدير النظام</p>
            </div>
          </div>
          <Button
            onClick={() => {
              localStorage.removeItem("crm_user");
              window.location.href = "/login";
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="mr-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-slate-900">
                {navItems.find((item) => isActive(item.href))?.name || "لوحة التحكم"}
              </h1>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
