import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "بيانات الدخول غير صحيحة");
        setLoading(false);
        return;
      }

      // store user in localStorage so the dashboard can read it
      if (typeof window !== "undefined") {
        localStorage.setItem("crm_user", JSON.stringify(data.user));
      }

      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">

        </div>

        <Card className="bg-white border-slate-200 shadow-xl">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-2xl font-bold text-slate-900 text-center">
              تسجيل الدخول
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  اسم المستخدم
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    required
                    value={credentials.email}
                    onChange={(e) =>
                      setCredentials({ ...credentials, email: e.target.value })
                    }
                    placeholder="admin"
                    className="pr-11 bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="pr-11 bg-slate-50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                {loading ? "جاري تسجيل الدخول..." : "دخول"}
              </Button>
            </form>

  
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
