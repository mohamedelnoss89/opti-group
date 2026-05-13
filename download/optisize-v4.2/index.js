import makeWASocket from '@whiskeysockets/baileys';
import { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import crypto from 'crypto';
import https from 'https';
import http from 'http';

// ========== الإعدادات ==========
const BOT_NUMBER = '01033345613';
const GROQ_API_KEY = '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';
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const DATA_FILE = '/tmp/optisize-data.json';
const AUTH_FOLDER = '/app/auth_info';
const PORT = 8080;

// ========== الأكواد الرئيسية (ماستر) ==========
const MASTER_CODES = {
  'SIZE2026': { maxUsers: 3, usedBy: [], permanent: true },
  'OPTI2026': { maxUsers: 3, usedBy: [], permanent: true },
  'EYES2026': { maxUsers: 3, usedBy: [], permanent: true }
};

// ========== حالة البوت ==========
let currentQR = null;
let botConnected = false;
let sock = null;
let data = loadData();

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (e) {
    console.log('خطأ في تحميل البيانات:', e.message);
  }
  return {
    normalCodes: {},
    activatedUsers: {},
    receiptHashes: {},
    processedMessages: {}
  };
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('خطأ في حفظ البيانات:', e.message);
  }
}

// ========== التحقق من الاشتراك ==========
function checkSubscription(userId) {
  const user = data.activatedUsers[userId];
  if (!user) return { active: false, reason: 'لا يوجد اشتراك' };
  if (user.permanent) return { active: true, plan: 'دائم (ماستر)' };
  const now = Date.now();
  const expiry = user.activatedAt + (30 * 24 * 60 * 60 * 1000);
  if (now > expiry) {
    return { active: false, reason: 'انتهت صلاحية الاشتراك' };
  }
  const daysLeft = Math.ceil((expiry - now) / (24 * 60 * 60 * 1000));
  return { active: true, plan: 'شهري', daysLeft };
}

// ========== تفعيل كود ==========
function activateCode(userId, code) {
  if (MASTER_CODES[code]) {
    const masterInfo = MASTER_CODES[code];
    if (masterInfo.usedBy.includes(userId)) {
      return { success: false, message: 'أنت بالفعل مشترك بهذا الكود' };
    }
    if (masterInfo.usedBy.length >= masterInfo.maxUsers) {
      return { success: false, message: 'هذا الكود وصل للحد الأقصى للمستخدمين' };
    }
    masterInfo.usedBy.push(userId);
    data.activatedUsers[userId] = {
      code: code,
      activatedAt: Date.now(),
      permanent: true,
      plan: 'ماستر'
    };
    saveData();
    return { success: true, message: 'تم تفعيل الاشتراك الدائم بنجاح! (ماستر)' };
  }

  if (data.normalCodes[code]) {
    const codeInfo = data.normalCodes[code];
    if (codeInfo.usedBy.includes(userId)) {
      return { success: false, message: 'أنت بالفعل مشترك بهذا الكود' };
    }
    if (codeInfo.usedBy.length >= codeInfo.maxUsers) {
      return { success: false, message: 'هذا الكود وصل للحد الأقصى للمستخدمين' };
    }
    codeInfo.usedBy.push(userId);
    data.activatedUsers[userId] = {
      code: code,
      activatedAt: Date.now(),
      permanent: false,
      plan: 'شهري'
    };
    saveData();
    return { success: true, message: 'تم تفعيل الاشتراك لمدة 30 يوم بنجاح!' };
  }

  return { success: false, message: 'كود غير صحيح' };
}

// ========== Groq AI لفحص الإيصال ==========
function analyzeReceipt(imageBuffer, mimeType) {
  return new Promise((resolve, reject) => {
    const base64Image = imageBuffer.toString('base64');
    const imageData = `data:${mimeType};base64,${base64Image}`;

    const requestBody = JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: `أنت خبير في فحص إيصالات الدفع المصري. مهمتك هي التحقق من الإيصال بدقة وعودة النتيجة بصيغة JSON فقط.

يجب التحقق من:
1. هل الإيصال حقيقي وليس مفبرك؟
2. هل المبلغ 50 جنيه أو أكثر؟
3. هل الإيصال من تطبيق أو بنك مصري معروف (فودافون كاش، فليكس، أورانج كاش، إنستاباي، نقدا، بنك مصر، بنك الأهلي، CIB، الخ)؟
4. هل التاريخ حديث (خلال آخر 7 أيام)؟
5. هل الإيصال لإيصال دفع وليس إيصال استلام؟
6. هل البيانات منطقية ومتسقة؟
7. هل لا يوجد علامات تعديل أو تلاعب؟

أجب بصيغة JSON فقط:
{
  "valid": true/false,
  "reason": "سبب القبول أو الرفض",
  "amount": المبلغ_إن_وجد,
  "provider": "اسم_مزود_الخدمة",
  "date": "التاريخ_من_الإيصال"
}`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'افحص هذا الإيصال وتحقق منه' },
            { type: 'image_url', image_url: { url: imageData } }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    });

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          const content = response.choices[0].message.content;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            resolve(JSON.parse(jsonMatch[0]));
          } else {
            resolve({ valid: false, reason: 'لم يتم تحليل الإيصال بشكل صحيح' });
          }
        } catch (e) {
          console.log('خطأ في تحليل رد Groq:', e.message);
          resolve({ valid: false, reason: 'خطأ في تحليل الإيصال' });
        }
      });
    });

    req.on('error', (e) => {
      console.log('خطأ في اتصال Groq:', e.message);
      resolve({ valid: false, reason: 'خطأ في الاتصال بخدمة التحليل' });
    });

    req.write(requestBody);
    req.end();
  });
}

// ========== فحص تكرار الإيصال ==========
function checkDuplicateReceipt(imageBuffer, userId) {
  const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
  if (data.receiptHashes[hash]) {
    return { duplicate: true, usedBy: data.receiptHashes[hash] };
  }
  return { duplicate: false, hash };
}

// ========== صفحة QR ==========
function generateQRHtml() {
  if (!currentQR) {
    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OptiSize Bot - QR</title>
<style>
  body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; text-align: center; padding: 50px 20px; }
  .container { max-width: 500px; margin: 0 auto; }
  h1 { color: #00d4ff; }
  .status { color: #ffd700; font-size: 18px; margin: 20px 0; }
  .info { color: #aaa; font-size: 14px; margin-top: 30px; }
</style>
</head>
<body>
<div class="container">
  <h1>OptiSize Bot</h1>
  <p class="status">جاري إنشاء رمز QR...</p>
  <p class="info">سيتم تحديث الصفحة تلقائياً كل 5 ثوانٍ</p>
</div>
<script>setTimeout(() => location.reload(), 5000);</script>
</body>
</html>`;
  }

  const qrEncoded = encodeURIComponent(currentQR);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${qrEncoded}`;

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OptiSize Bot - QR</title>
<style>
  body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; text-align: center; padding: 50px 20px; }
  .container { max-width: 500px; margin: 0 auto; }
  h1 { color: #00d4ff; }
  .qr-box { background: #fff; padding: 20px; border-radius: 16px; display: inline-block; margin: 20px 0; box-shadow: 0 0 30px rgba(0,212,255,0.3); }
  .qr-box img { display: block; width: 400px; height: 400px; }
  .status { color: #00ff88; font-size: 18px; }
  .warning { color: #ffd700; font-size: 14px; margin-top: 15px; }
  .info { color: #aaa; font-size: 13px; margin-top: 20px; }
</style>
</head>
<body>
<div class="container">
  <h1>OptiSize Bot</h1>
  <p class="status">امسح رمز QR بواتساب</p>
  <div class="qr-box">
    <img src="${qrImageUrl}" alt="WhatsApp QR Code" />
  </div>
  <p class="warning">افتح واتساب > الإعدادات > الأجهزة المرتبطة > ربط جهاز</p>
  <p class="info">يتم تحديث QR تلقائياً كل 5 ثوانٍ</p>
</div>
<script>setTimeout(() => location.reload(), 5000);</script>
</body>
</html>`;
}

// ========== HTTP Server - يشتغل أولاً ==========
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/' || url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      bot: botConnected ? 'متصل' : 'ينتظر QR',
      uptime: process.uptime()
    }));
  } else if (url === '/qr') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(generateQRHtml());
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 - Not Found</h1><p>الصفحات المتاحة: <a href="/qr">/qr</a> - <a href="/">/</a></p>');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`السيرفر يعمل على البورت ${PORT}`);
  console.log('افتح /qr للحصول على رمز QR');
  setTimeout(startBot, 10000);
});

// ========== تشغيل البوت ==========
async function startBot() {
  console.log('جاري تشغيل البوت...');
  try {
    // لا نحذف auth_info عشان البوت يفضل متصل
    await connectToWhatsApp();
  } catch (error) {
    console.log('خطأ في تشغيل البوت:', error.message);
    setTimeout(startBot, 30000);
  }
}

async function connectToWhatsApp() {
  try {
    console.log('جاري الاتصال بواتساب...');
    const { version } = await fetchLatestBaileysVersion();
    console.log('إصدار واتساب:', version.join('.'));

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

    const connectOpts = {
      version,
      auth: state,
      printQRInTerminal: true,
      logger: pino({ level: 'silent' }),
      browser: ['OptiSize Bot', 'Chrome', '4.2'],
      generateHighQualityLinkPreview: false,
      getMessage: async () => undefined
    };

    // التعامل مع الـ import بشكل صحيح
    if (typeof makeWASocket === 'function') {
      sock = makeWASocket(connectOpts);
    } else if (makeWASocket.default && typeof makeWASocket.default === 'function') {
      sock = makeWASocket.default(connectOpts);
    } else {
      console.log('خطأ: لم يتم العثور على makeWASocket');
      setTimeout(connectToWhatsApp, 30000);
      return;
    }

    console.log('تم إنشاء الاتصال، جاري انتظار QR...');

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      console.log('تحديث الاتصال:', connection || 'QR');

      if (qr) {
        currentQR = qr;
        botConnected = false;
        console.log('تم إنشاء رمز QR - افتح /qr للمسح');
      }

      if (connection === 'open') {
        botConnected = true;
        currentQR = null;
        console.log('البوت متصل بنجاح!');
      }

      if (connection === 'close') {
        let statusCode = 0;
        try {
          const err = lastDisconnect?.error;
          if (err) {
            statusCode = err?.output?.statusCode || err?.statusCode || 0;
            if (statusCode === 0 && err?.message) {
              const match = err.message.match(/(\d{3})/);
              if (match) statusCode = parseInt(match[1]);
            }
          }
        } catch (e) {}

        console.log('تم قطع الاتصال. الكود:', statusCode);
        botConnected = false;
        currentQR = null;

        if (statusCode === 405 || statusCode === 403 || statusCode === 428 || statusCode === DisconnectReason.loggedOut) {
          console.log('الرقم محظور أو تم تسجيل الخروج - تنظيف وإعادة المحاولة بعد 5 دقائق');
          try {
            if (fs.existsSync(AUTH_FOLDER)) {
              fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
            }
          } catch (e) {}
          setTimeout(() => connectToWhatsApp(), 300000);
        } else {
          console.log('إعادة الاتصال بعد 5 ثوانٍ...');
          setTimeout(() => connectToWhatsApp(), 5000);
        }
      }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        try {
          await handleMessage(msg);
        } catch (e) {
          console.log('خطأ في معالجة الرسالة:', e.message);
        }
      }
    });

  } catch (error) {
    console.log('خطأ في الاتصال:', error.message);
    console.log('إعادة المحاولة بعد 30 ثانية...');
    setTimeout(connectToWhatsApp, 30000);
  }
}

// ========== معالجة الرسائل ==========
async function handleMessage(msg) {
  if (!msg.key || msg.key.fromMe) return;

  const userId = msg.key.remoteJid;
  const messageId = msg.key.id;

  if (data.processedMessages[messageId]) return;
  data.processedMessages[messageId] = Date.now();
  saveData();

  const msgText = msg.message?.conversation ||
                  msg.message?.extendedTextMessage?.text ||
                  msg.message?.imageMessage?.caption ||
                  '';

  const hasImage = msg.message?.imageMessage ? true : false;

  if (msgText.trim() === 'اشتراكي') {
    const sub = checkSubscription(userId);
    if (sub.active) {
      const info = sub.plan === 'دائم (ماستر)' ? 'دائم (ماستر)' : `شهري (${sub.daysLeft} يوم متبقي)`;
      await sock.sendMessage(userId, { text: `حالة اشتراكك: نشط\nالخطة: ${info}` });
    } else {
      await sock.sendMessage(userId, { text: `حالة اشتراكك: غير نشط\nالسبب: ${sub.reason}\n\nأرسل "تفعيل" ثم الكود للاشتراك` });
    }
    return;
  }

  if (msgText.trim() === 'تفعيل') {
    await sock.sendMessage(userId, { text: 'أرسل الكود الآن:' });
    return;
  }

  if (msgText.trim().startsWith('تفعيل ')) {
    const code = msgText.trim().replace('تفعيل ', '').trim();
    const result = activateCode(userId, code);
    await sock.sendMessage(userId, { text: result.message });
    return;
  }

  if (msgText.trim() === 'مساعدة' || msgText.trim() === 'الاوامر') {
    const helpText = `أوامر OptiSize Bot:

اشتراكي - معرفة حالة الاشتراك
تفعيل [كود] - تفعيل اشتراك جديد
إيصال - إرسال إيصال الدفع
مساعدة - عرض الأوامر

أرسل صورة إيصال الدفع مباشرة للتحقق منه`;
    await sock.sendMessage(userId, { text: helpText });
    return;
  }

  if (msgText.trim() === 'إيصال') {
    await sock.sendMessage(userId, { text: 'أرسل صورة إيصال الدفع (50 جنيه) مباشرة\nمثل: فودافون كاش، فليكس، إنستاباي، الخ' });
    return;
  }

  if (hasImage) {
    const sub = checkSubscription(userId);
    if (!sub.active) {
      await sock.sendMessage(userId, { text: `اشتراكك غير نشط\n${sub.reason}\n\nأرسل "تفعيل" ثم الكود للاشتراك` });
      return;
    }

    try {
      await sock.sendMessage(userId, { text: 'جاري فحص الإيصال...' });

      const imageMsg = msg.message.imageMessage;
      const mimeType = imageMsg.mimetype || 'image/jpeg';

      const stream = await sock.downloadMediaMessage(msg, 'buffer');
      const imageBuffer = Buffer.from(stream);

      const dupCheck = checkDuplicateReceipt(imageBuffer, userId);
      if (dupCheck.duplicate) {
        await sock.sendMessage(userId, { text: 'تم استخدام هذا الإيصال من قبل! لا يمكن استخدام نفس الإيصال مرتين.' });
        return;
      }

      const analysis = await analyzeReceipt(imageBuffer, mimeType);

      if (analysis.valid) {
        data.receiptHashes[dupCheck.hash] = userId;
        saveData();
        await sock.sendMessage(userId, {
          text: `تم تأكيد الإيصال بنجاح!\n\nالمبلغ: ${analysis.amount || '50 جنيه'}\nالمزود: ${analysis.provider || 'غير محدد'}\nالتاريخ: ${analysis.date || 'غير محدد'}\n\nشكراً لدفعك!`
        });
      } else {
        await sock.sendMessage(userId, {
          text: `تم رفض الإيصال\nالسبب: ${analysis.reason}\n\nأرسل إيصال صحيح بقيمة 50 جنيه أو أكثر`
        });
      }
    } catch (e) {
      console.log('خطأ في معالجة الإيصال:', e.message);
      await sock.sendMessage(userId, { text: 'حدث خطأ في فحص الإيصال. حاول مرة أخرى.' });
    }
    return;
  }

  await sock.sendMessage(userId, {
    text: 'مرحباً بك في OptiSize Bot!\n\nأرسل "مساعدة" لعرض الأوامر'
  });
}

// ========== تنظيف البيانات القديمة ==========
setInterval(() => {
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  let cleaned = 0;
  for (const [msgId, timestamp] of Object.entries(data.processedMessages)) {
    if (timestamp < oneWeekAgo) {
      delete data.processedMessages[msgId];
      cleaned++;
    }
  }
  if (cleaned > 0) {
    saveData();
    console.log(`تم تنظيف ${cleaned} رسالة قديمة`);
  }
}, 86400000);

// منع توقف السيرفر عند خطأ غير متوقع
process.on('uncaughtException', (err) => {
  console.log('خطأ غير متوقع:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.log('وعد مرفوض:', err?.message || err);
});

console.log('OptiSize Bot v4.2 جاهز');
