# نظام إدارة الاستثمار - Zenith Oasis

نظام شامل لإدارة الاستثمارات والمستثمرين مع واجهة عربية حديثة.

## المميزات

- إدارة المستثمرين والحصص
- تتبع المصاريف والإيرادات
- سجل العمليات المالية
- لوحة تحكم تفاعلية
- اتصال مع قاعدة بيانات Supabase
- واجهة مستخدم عربية

## التقنيات المستخدمة

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase
- **Build Tool**: Vite
- **Deployment**: Netlify

## إعداد البيئة المحلية

1. تثبيت التبعيات:
```bash
npm install
```

2. إعداد متغيرات البيئة:
```bash
cp .env.example .env
```

3. تحديث ملف `.env` بمعلومات Supabase:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. بناء التطبيق:
```bash
npm run build
```

5. تشغيل التطبيق:
```bash
npm start
```

## النشر على Netlify

1. ارفع الملفات إلى مستودع Git
2. اربط المستودع مع Netlify
3. اضبط إعدادات البناء:
   - Build command: `npm run build:client`
   - Publish directory: `dist/spa`
4. أضف متغيرات البيئة في إعدادات Netlify

## بيانات تسجيل الدخول

- **اسم المستخدم**: 32768057
- **كلمة المرور**: 27562254

## الهيكل

```
├── client/          # تطبيق React
├── server/          # خادم Express
├── shared/          # الأنواع المشتركة
├── netlify/         # إعدادات Netlify
└── dist/            # ملفات البناء
```

## الدعم

للمساعدة أو الاستفسارات، يرجى التواصل مع فريق التطوير.

