// src/pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { email, password } = req.body || {};

  // 1) real values come from env if available
  const ADMIN_USER = process.env.ADMIN_USER || "admin";
  const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";

  // 2) compare
  if (email === ADMIN_USER && password === ADMIN_PASS) {
    // don’t send password back
    return res.status(200).json({
      success: true,
      user: {
        name: "المدير",
        email: ADMIN_USER,
        role: "admin",
      },
    });
  }

  return res.status(401).json({
    success: false,
    message: "بيانات الدخول غير صحيحة",
  });
}
