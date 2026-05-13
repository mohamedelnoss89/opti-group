# OptiSize Bot - ملخص التقدم
## تاريخ آخر تحديث: 2026-05-12

---

## ✅ الحالة الحالية: البوت شغال ومتصل

### معلومات البوت
- **الرقم**: 01033345613
- **الرقم القديم**: 201028900122 (محظور 405 - لا تستخدمه)
- **المنصة**: Back4App Containers
- **الإصدار**: v4.2
- **GitHub**: Ghaliamohamed503/optisize-bot (Private)

---

## 📁 ملفات المشروع

### index.js (v4.2)
- طريقة الاتصال: QR Code (مش Pairing Code)
- مكتبة واتساب: @whiskeysockets/baileys (ESM)
- QR Code عبر API خارجي: api.qrserver.com
- HTTP Server على بورت 8080
- `makeWASocket` مع فحص function/default للـ ESM
- حذف auth_info **معطل** (معلق بـ //) عشان الجلسة تفضل شغالة
- 7 شروط أمان للإيصالات
- أكواد رئيسية + أكواد عادية
- تحليل إيصالات بـ Groq AI

### package.json
```json
{
  "name": "optisize-bot",
  "version": "4.2.0",
  "type": "module",
  "main": "index.js",
  "scripts": { "start": "node index.js" },
  "dependencies": {
    "@whiskeysockets/baileys": "^6.7.0",
    "pino": "^8.0.0",
    "@hapi/boom": "^10.0.0"
  }
}
```

### Dockerfile
```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8080
CMD ["node", "index.js"]
```

### .gitignore
```
auth_info/
node_modules/
.env
*.log
```

---

## 🔑 الأكواد

### أكواد رئيسية (دائم - 3 مستخدمين لكل كود)
| الكود | المستخدمين المسموح | النوع |
|-------|-------------------|-------|
| SIZE2026 | 3 | دائم |
| OPTI2026 | 3 | دائم |
| EYES2026 | 3 | دائم |

### أكواد عادية (30 يوم - مستخدم واحد)
| الكود | المستخدمين المسموح | المدة |
|-------|-------------------|-------|
| OPT-A7X9K2 | 1 | 30 يوم |
| OPT-B3M5N8 | 1 | 30 يوم |
| OPT-C4P6R1 | 1 | 30 يوم |
| OPT-D2T8W4 | 1 | 30 يوم |
| OPT-E6V1Y7 | 1 | 30 يوم |
| OPT-F9H3J5 | 1 | 30 يوم |

---

## 🔄 نظام الاشتراك

### طريقين للاشتراك:
1. **إيصال دفع**: العميل يحول 50 جنيه على 01033345613 ويبعت صورة الإيصال → البوت يحلله → اشتراك 30 يوم
2. **كود تفعيل**: العميل يبعت "كود XXXXXXX" → البوت يفعل الاشتراك

### أوامر البوت:
- أي رسالة ترحيبية (1, مرحبا, hi) → رسالة ترحيبية
- `كود XXXXXXX` → تفعيل كود
- `حالتي` أو `status` → حالة الاشتراك
- صورة → فحص إيصال

---

## ⚠️ مهم: Environment Variable
لازم تضيف في Back4App → Settings → Environment Variables:
```
GROQ_API_KEY = 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
```
من غير ده فحص الإيصالات مش هيشتغل!

---

## 🐛 مشاكل اتحلت
1. مكتبة qrcode بتطلب canvas (مش موجودة في node:20-slim) → استخدمنا API خارجي
2. @hapi/boom مش مضاف كـ dependency → اتفضاف في v4.2
3. makeWASocket.default() مش شغال دايماً → فحص function/default
4. السيرفر مش بيبص على 0.0.0.0 → server.listen(PORT, '0.0.0.0')
5. الجلسة بتتمسح كل redeploy → تعطيل حذف auth_info

---

## 📋 مهام بكره إن شاء الله
1. [ ] إضافة GROQ_API_KEY في Environment Variables على Back4App
2. [ ] تجربة الأكواد (كود SIZE2026 مثلاً)
3. [ ] تجربة فحص إيصال بصورة حقيقية
4. [ ] إضافة رسالة ترحيبية أوضح للعميل الجديد؟
5. [ ] إضافة أوامر إدارية (أضف كود، حذف مشترك، إلخ)؟
