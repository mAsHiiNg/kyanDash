
// Customer Status Labels (Arabic)
export const CUSTOMER_STATUS_LABELS: Record<string, string> = {
  new_contact: "تواصل جديد",
  appointment_set: "تحديد موعد",
  quotation_sent: "إرسال عرض",
  follow_up: "متابعة",
  active_client: "عميل فعلي"
};

// Customer Status Colors
export const CUSTOMER_STATUS_COLORS: Record<string, string> = {
  new_contact: "bg-blue-100 text-blue-700 border-blue-200",
  appointment_set: "bg-purple-100 text-purple-700 border-purple-200",
  quotation_sent: "bg-orange-100 text-orange-700 border-orange-200",
  follow_up: "bg-yellow-100 text-yellow-700 border-yellow-200",
  active_client: "bg-green-100 text-green-700 border-green-200"
};

// Customer Source Labels (Arabic)
export const CUSTOMER_SOURCE_LABELS: Record<string, string> = {
  instagram: "إنستغرام",
  whatsapp: "واتساب",
  referral: "توصية",
  website: "الموقع الإلكتروني",
  advertisement: "إعلان",
  other: "أخرى"
};

// Meeting Type Labels (Arabic)
export const MEETING_TYPE_LABELS: Record<string, string> = {
  in_person: "وجاهي",
  online: "أونلاين",
  phone: "هاتفي"
};

// Followup Method Labels (Arabic)
export const FOLLOWUP_METHOD_LABELS: Record<string, string> = {
  call: "اتصال",
  whatsapp: "واتساب",
  email: "بريد إلكتروني",
  meeting: "اجتماع"
};

// Quotation Status Labels (Arabic)
export const QUOTATION_STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  sent: "مرسل",
  accepted: "مقبول",
  rejected: "مرفوض"
};

// Payment Status Labels (Arabic)
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: "مدفوع",
  pending: "معلق",
  overdue: "متأخر",
  partial: "جزئي"
};

// User Role Labels (Arabic)
export const USER_ROLE_LABELS: Record<string, string> = {
  admin: "مدير النظام",
  manager: "مدير",
  sales: "مبيعات",
  employee: "موظف"
};

// Activity Type Labels (Arabic)
export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  customer_created: "تم إضافة العميل",
  customer_updated: "تم تحديث بيانات العميل",
  meeting_scheduled: "تم جدولة اجتماع",
  meeting_completed: "تم إكمال الاجتماع",
  quotation_sent: "تم إرسال عرض سعر",
  quotation_accepted: "تم قبول العرض",
  quotation_rejected: "تم رفض العرض",
  followup_scheduled: "تم جدولة متابعة",
  followup_completed: "تم إكمال المتابعة",
  status_changed: "تم تغيير الحالة",
  service_added: "تم إضافة خدمة",
  service_updated: "تم تحديث الخدمة"
};

// Currency Options
export const CURRENCY_OPTIONS = [
  { value: "SAR", label: "ريال سعودي (SAR)" },
  { value: "AED", label: "درهم إماراتي (AED)" },
  { value: "USD", label: "دولار أمريكي (USD)" },
  { value: "EUR", label: "يورو (EUR)" }
];

// Common Services (predefined)
export const COMMON_SERVICES = [
  "خطة تسويقية شاملة",
  "إدارة صفحات السوشيال ميديا",
  "تصميم جرافيك",
  "إدارة الإعلانات الممولة",
  "تصوير فوتوغرافي",
  "تصوير فيديو",
  "كتابة محتوى",
  "تحسين محركات البحث (SEO)",
  "تصميم وتطوير مواقع",
  "تطوير تطبيقات الجوال",
  "استشارات تسويقية",
  "تصميم هوية تجارية"
];
