// ====== OptiSize WhatsApp Bot v4.1 - QR Code Method ======
// بنستخدم QR API خارجي بدل مكتبة qrcode (عشان node:20-slim مش فيه canvas)

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  getContentType
} from '@whiskeysockets/baileys';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============ الإعدادات ============
const PAYMENT_NUMBER = '01033345613';
const REQUIRED_AMOUNT = 50;
const SUBSCRIPTION_DAYS = 30;
const MAX_RECEIPT_AGE_HOURS = 24;

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ============ الماستر كودات ============
const MASTER_CODES = {
  'SIZE2026':  { maxUsers: 3, usedBy: [] },
  'OPTI2026':  { maxUsers: 3, usedBy: [] },
  'EYES2026':  { maxUsers: 3, usedBy: [] }
};

// ============ ملفات البيانات ============
const DATA_FILE = path.join('/tmp', 'optisize-data.json');

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('خطأ في تحميل البيانات:', e.message);
  }
  return {
    customers: {},
    codes: {},
    receiptHashes: {},
    masterCodes: JSON.parse(JSON.stringify(MASTER_CODES))
  };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('خطأ في حفظ البيانات:', e.message);
  }
}

// ============ توليد كود عادي ============
function generateNormalCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'OPT-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ============ SHA256 للصور (منع التكرار) ============
function hashImage(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function isReceiptDuplicate(imgHash) {
  const data = loadData();
  return !!data.receiptHashes[imgHash];
}

function markReceiptUsed(imgHash, phone) {
  const data = loadData();
  data.receiptHashes[imgHash] = {
    usedBy: phone,
    usedAt: new Date().toISOString()
  };
  saveData(data);
}

// ============ إدارة العملاء ============
function addSubscription(phone, code, method) {
  const data = loadData();
  if (!data.customers[phone]) {
    data.customers[phone] = {
      phone: phone,
      createdAt: new Date().toISOString(),
      subscriptions: [],
      receiptCount: 0
    };
  }
  const now = new Date();
  const expiry = new Date(now.getTime() + SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000);
  data.customers[phone].subscriptions.push({
    code: code,
    activatedAt: now.toISOString(),
    expiresAt: expiry.toISOString(),
    method: method || 'receipt'
  });
  data.customers[phone].receiptCount++;
  saveData(data);
  return expiry;
}

function isCustomerSubscribed(phone) {
  const data = loadData();
  const customer = data.customers[phone];
  if (!customer || !customer.subscriptions || customer.subscriptions.length === 0) return false;
  const latest = customer.subscriptions[customer.subscriptions.length - 1];
  return new Date(latest.expiresAt) > new Date();
}

// ============ التحقق من الكودات ============
function verifyCode(code, phone) {
  const data = loadData();

  if (MASTER_CODES[code]) {
    if (!data.masterCodes) data.masterCodes = JSON.parse(JSON.stringify(MASTER_CODES));
    if (!data.masterCodes[code]) data.masterCodes[code] = { maxUsers: 3, usedBy: [] };

    if (data.masterCodes[code].usedBy.length >= data.masterCodes[code].maxUsers) {
      return { success: false, message: '❌ الكود ده وصل للحد الأقصى للاستخدام' };
    }
    if (data.masterCodes[code].usedBy.includes(phone)) {
      return { success: false, message: '❌ انت استخدمت الكود ده قبل كده' };
    }

    data.masterCodes[code].usedBy.push(phone);
    const expiry = addSubscription(phone, code, 'master_code');
    saveData(data);
    return {
      success: true,
      message: `✅ تم تفعيل الاشتراك بالماستر كود!\n📅 ينتهي في: ${expiry.toLocaleDateString('ar-EG')}\n🔑 الكود: ${code}\n\nادخل الكود في تطبيق OptiSize في مركز صحة العين`
    };
  }

  if (data.codes[code]) {
    const codeData = data.codes[code];
    if (codeData.used) {
      return { success: false, message: '❌ الكود ده تم استخدامه قبل كده' };
    }
    if (codeData.phone !== phone) {
      return { success: false, message: '❌ الكود ده مش ليك' };
    }
    codeData.used = true;
    codeData.usedAt = new Date().toISOString();
    const expiry = addSubscription(phone, code, 'normal_code');
    saveData(data);
    return {
      success: true,
      message: `✅ تم تفعيل الاشتراك!\n📅 ينتهي في: ${expiry.toLocaleDateString('ar-EG')}\n🔑 الكود: ${code}\n\nادخل الكود في تطبيق OptiSize في مركز صحة العين`
    };
  }

  return { success: false, message: '❌ الكود غير صحيح' };
}

// ============ تاريخ مصر ============
function getEgyptNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' }));
}

// ============ Groq AI: تحقق من الإيصال (الشروط السبعة) ============
const RECEIPT_PROMPT = `أنت نظام تحقق صارم جداً من إيصالات الدفع. لازم تتأكد من 7 شروط:

الشرط 1: الرقم المحول ليه لازم يكون 01033345613 بالظبط
الشرط 2: المبلغ لازم يكون 50 جنيه بالظبط
الشرط 3: العملية لازم تكون ناجحة (تم التحويل / تحويل ناجح / تم الدفع)
الشرط 4: التاريخ والوقت لازم يكون مش أقدم من 24 ساعة
الشرط 5: الصورة لازم تكون إيصال حقيقي مش مزور
الشرط 6: لازم فيه كلمات تدل على الدفع أو التحويل
الشرط 7: الإيصال لازم يبدو حقيقي (مش مصنوع من تطبيق تزوير)

⚠️ قواعد صارمة:
- لو المبلغ مش 50 جنيه بالظبط → مرفوض
- لو الرقم مش 01033345613 → مرفوض
- لو التاريخ أقدم من 24 ساعة → مرفوض
- لو مفيش كلمة تدل على نجاح العملية → مرفوض
- لو الصورة مش إيصال دفع حقيقي → مرفوض

أجب بصيغة JSON فقط:
{
  "is_receipt": true/false,
  "phone_number": "الرقم المحول ليه",
  "amount": المبلغ_رقم_فقط,
  "is_successful": true/false,
  "success_keyword": "الكلمة اللي بتدل على نجاح العملية",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "looks_genuine": true/false,
  "genuine_reason": "سبب",
  "payment_method": "طريقة الدفع",
  "receipt_number": "رقم الإيصال",
  "all_checks_passed": true/false,
  "rejection_reason": "سبب الرفض لو مرفوض أو فارغ"
}`;

async function verifyReceiptWithAI(imageBuffer, mimeType) {
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Image}`;
  const egyptNow = getEgyptNow();
  const todayStr = egyptNow.toISOString().split('T')[0];
  const currentTimeStr = egyptNow.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: RECEIPT_PROMPT + `\n\nالتاريخ الحالي: ${todayStr}\nالوقت الحالي: ${currentTimeStr}` },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        }],
        temperature: 0.1,
        max_tokens: 800
      })
    });

    const result = await response.json();
    if (!result.choices || !result.choices[0]) {
      console.error('Groq error:', JSON.stringify(result));
      return null;
    }

    let content = result.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON in AI response:', content);
      return null;
    }

    const data = JSON.parse(jsonMatch[0]);
    console.log('🤖 AI Result:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('AI verify error:', error.message);
    return null;
  }
}

// ============ التحقق البرمجي من الشروط السبعة ============
function verifySevenConditions(aiResult) {
  if (!aiResult) return { passed: false, reasons: ['فشل تحليل الصورة بالذكاء الاصطناعي'] };

  const reasons = [];
  const egyptNow = getEgyptNow();

  const phone = String(aiResult.phone_number || '').replace(/\s/g, '');
  const phoneOk = phone.includes(PAYMENT_NUMBER) || phone.includes('2' + PAYMENT_NUMBER);
  if (!phoneOk) reasons.push(`الرقم المحول ليه (${aiResult.phone_number}) مش ${PAYMENT_NUMBER}`);

  const amount = parseFloat(aiResult.amount) || 0;
  const amountOk = amount === REQUIRED_AMOUNT;
  if (!amountOk) reasons.push(`المبلغ (${amount}) مش ${REQUIRED_AMOUNT} جنيه`);

  const successOk = aiResult.is_successful === true;
  if (!successOk) reasons.push('العملية مش ناجحة أو مفيش كلمة تدل على نجاح التحويل');

  let dateOk = false;
  if (aiResult.date && aiResult.date !== 'غير محدد') {
    try {
      const receiptDate = new Date(aiResult.date);
      if (aiResult.time && aiResult.time !== 'غير محدد') {
        const [h, m] = aiResult.time.split(':').map(Number);
        receiptDate.setHours(h, m, 0, 0);
      }
      const diffHours = (egyptNow - receiptDate) / (1000 * 60 * 60);
      dateOk = diffHours >= 0 && diffHours <= MAX_RECEIPT_AGE_HOURS;
    } catch (e) {
      console.error('Date parse error:', e.message);
    }
    if (!dateOk) {
      const today = egyptNow.toISOString().split('T')[0];
      const yesterday = new Date(egyptNow - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      dateOk = aiResult.date === today || aiResult.date === yesterday;
    }
  }
  if (!dateOk) reasons.push(`التاريخ (${aiResult.date || 'غير محدد'}) أقدم من ${MAX_RECEIPT_AGE_HOURS} ساعة`);

  const genuineOk = aiResult.looks_genuine === true;
  if (!genuineOk) reasons.push(`الإيصال مش حقيقي: ${aiResult.genuine_reason || 'مش واضح'}`);

  const isReceiptOk = aiResult.is_receipt === true;
  if (!isReceiptOk) reasons.push('الصورة مش إيصال دفع');

  const passed = phoneOk && amountOk && successOk && dateOk && genuineOk && isReceiptOk;

  return { passed, reasons, checks: { phoneOk, amountOk, successOk, dateOk, genuineOk, isReceiptOk } };
}

// ============ رسائل البوت ============
const WELCOME_MSG = `مرحباً بك في OptiSize! 👁️

كيف يمكنني مساعدتك؟

1️⃣ اشتراك - اشترك في مركز صحة العين VIP (50 جنيه/شهر)
2️⃣ كود - ادخل كود اشتراك
3️⃣ حالتي - معرفة حالة اشتراكك
4️⃣ تحدث - تحدث مع فريق الدعم

أرسل الرقم أو الكلمة 👇`;

const SUB_INFO_MSG = `💎 اشتراك مركز صحة العين VIP

قيمة الاشتراك: 50 جنيه شهرياً

💰 طريقة الدفع:
حول 50 جنيه على رقم:
📱 ${PAYMENT_NUMBER}

(فودافون كاش / إنستاباي / أي طريقة تحويل)

بعد الدفع أرسل صورة تأكيد الدفع هنا ✅

📸 تأكد أن الصورة توضح:
- الرقم المحول ليه (${PAYMENT_NUMBER})
- المبلغ (50 جنيه)
- تاريخ ووقت التحويل
- كلمة تدل على نجاح العملية (تم التحويل / تحويل ناجح)`;

// ============ حالة المستخدمين ============
let userStates = {};
let ownerChatActive = {};
let botConnected = false;
let sock = null;
let currentQR = null;
let qrGeneratedAt = null;

// ============ إرسال آمن ============
async function safeSend(jid, content) {
  if (!sock || !botConnected) {
    console.log('⚠️ Cannot send: not connected');
    return false;
  }
  try {
    await sock.sendMessage(jid, content);
    return true;
  } catch (e) {
    console.error('❌ Send error:', e.message);
    return false;
  }
}

// ============ معالجة الإيصال ============
async function handleReceipt(from, phone, msg) {
  await safeSend(from, { text: '⏳ جاري مراجعة إيصال الدفع...' });

  try {
    const buf = await downloadMediaMessage(msg, 'buffer', {}, { logger: undefined, reuploadRequest: undefined });

    if (!buf || buf.length === 0) {
      await safeSend(from, { text: '❌ مش قادر أحمل الصورة. حاول تبعتها تاني.' });
      return;
    }

    console.log(`📸 Receipt downloaded: ${(buf.length / 1024).toFixed(1)}KB from ${phone}`);

    const imgHash = hashImage(buf);
    if (isReceiptDuplicate(imgHash)) {
      await safeSend(from, {
        text: '❌ الإيصال ده تم استخدامه قبل كده!\n\nكل إيصال بيتم استخدامه مرة واحدة فقط.\nلو حولت تاني، ابعت صورة الإيصال الجديد.'
      });
      console.log(`🔄 Duplicate receipt from ${phone}`);
      return;
    }

    const mimeType = msg.message?.imageMessage?.mimetype || 'image/jpeg';
    const aiResult = await verifyReceiptWithAI(buf, mimeType);

    if (!aiResult) {
      await safeSend(from, {
        text: '❌ حصل خطأ في تحليل الإيصال.\n\nتأكد إن الصورة واضحة وابعتها تاني.\nلو المشكلة مستمرة، تواصل مع الدعم.'
      });
      return;
    }

    const verification = verifySevenConditions(aiResult);

    console.log(`🔍 Verification for ${phone}: passed=${verification.passed}`);
    if (verification.checks) {
      console.log(`   phone=${verification.checks.phoneOk} amount=${verification.checks.amountOk} success=${verification.checks.successOk} date=${verification.checks.dateOk} genuine=${verification.checks.genuineOk} isReceipt=${verification.checks.isReceiptOk}`);
    }

    if (verification.passed) {
      markReceiptUsed(imgHash, phone);

      const code = generateNormalCode();
      const data = loadData();
      data.codes[code] = {
        phone: phone,
        createdAt: new Date().toISOString(),
        used: false,
        method: aiResult.payment_method || 'receipt'
      };
      saveData(data);

      addSubscription(phone, code, 'receipt');
      userStates[phone] = 'idle';

      await safeSend(from, {
        text: `✅ تم تأكيد الدفع بنجاح!\n\n🔑 كود الاشتراك: ${code}\n\nادخل الكود في تطبيق OptiSize في مركز صحة العين\n⏰ صالح لمدة ${SUBSCRIPTION_DAYS} يوم\n\nشكراً لاشتراكك! 🙏`
      });

      console.log(`✅ Receipt ACCEPTED for ${phone}, code: ${code}`);

    } else {
      const reasonText = verification.reasons.join('\n- ');

      await safeSend(from, {
        text: `❌ الإيصال غير مقبول.\n\nالسبب:\n- ${reasonText}\n\nتأكد إن الإيصال بيوضح:\n- الرقم: ${PAYMENT_NUMBER}\n- المبلغ: 50 جنيه بالظبط\n- كلمة تدل على نجاح العملية (تم التحويل)\n- تاريخ ووقت التحويل (مش أقدم من 24 ساعة)\n\nأرسل صورة الإيصال الصحيحة تاني ✅`
      });

      console.log(`❌ Receipt REJECTED for ${phone}: ${reasonText}`);
    }

  } catch (e) {
    console.error('❌ Receipt handler error:', e.message);
    await safeSend(from, { text: '⚠️ حصل خطأ في معالجة الإيصال. حاول تاني.' });
  }
}

// ============ توليد HTML لصفحة الـ QR (بدون qrcode package) ============
function generateQRHtml(qrText, connected, qrTime) {
  if (connected) {
    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OptiSize Bot - متصل</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #0a0a0a; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .container { text-align: center; padding: 40px; }
    .status-icon { font-size: 80px; margin-bottom: 20px; }
    h1 { color: #00d26a; font-size: 28px; margin-bottom: 10px; }
    p { color: #aaa; font-size: 16px; }
    .pulse { animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="status-icon pulse">&#10004;</div>
    <h1>البوت متصل!</h1>
    <p>بوت واتساب OptiSize شغال بنجاح</p>
  </div>
</body>
</html>`;
  }

  if (!qrText) {
    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OptiSize Bot - في الانتظار</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #0a0a0a; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .container { text-align: center; padding: 40px; }
    .spinner { width: 60px; height: 60px; border: 4px solid #333; border-top-color: #25d366; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h1 { color: #25d366; font-size: 24px; margin-bottom: 10px; }
    p { color: #aaa; font-size: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1>جاري توليد QR Code...</h1>
    <p>الصفحة هتتحدث تلقائياً</p>
  </div>
  <script>setTimeout(()=>location.reload(),3000);</script>
</body>
</html>`;
  }

  // استخدام API خارجي لتوليد صورة QR
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrText)}`;
  const timeAgo = qrTime ? Math.round((Date.now() - qrTime) / 1000) : '?';

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OptiSize Bot - QR Code</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #0a0a0a; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .container { text-align: center; padding: 30px; max-width: 500px; }
    .qr-frame { background: #fff; padding: 20px; border-radius: 16px; display: inline-block; margin: 20px 0; box-shadow: 0 0 40px rgba(37,211,102,0.3); }
    .qr-frame img { width: 300px; height: 300px; }
    h1 { color: #25d366; font-size: 24px; margin-bottom: 8px; }
    .steps { text-align: right; background: #1a1a1a; padding: 20px; border-radius: 12px; margin: 16px 0; }
    .steps h3 { color: #25d366; margin-bottom: 12px; }
    .steps ol { padding-right: 20px; color: #ccc; }
    .steps li { margin-bottom: 8px; line-height: 1.6; }
    .timer { color: #888; font-size: 14px; margin-top: 12px; }
    .timer span { color: #25d366; font-weight: bold; }
    .warning { background: #2a1a00; border: 1px solid #ff9800; border-radius: 8px; padding: 12px; margin-top: 12px; color: #ff9800; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>امسح QR Code</h1>
    <div class="qr-frame">
      <img src="${qrImageUrl}" alt="QR Code" />
    </div>
    <div class="steps">
      <h3>خطوات الربط:</h3>
      <ol>
        <li>افتح واتساب على الموبايل</li>
        <li>روح الإعدادات > الأجهزة المرتبطة</li>
        <li>اضغط على "ربط جهاز"</li>
        <li>امسح الكود ده من الشاشة</li>
      </ol>
    </div>
    <div class="timer">الكود يتحدث كل 20 ثانية | منذ التوليد: <span id="age">${timeAgo}</span>ث</div>
    <div class="warning">لو الكود انتهى، الصفحة هتتحدث تلقائياً</div>
  </div>
  <script>setTimeout(()=>location.reload(),5000); setInterval(()=>{let e=document.getElementById('age'); e.textContent=parseInt(e.textContent)+1;},1000);</script>
</body>
</html>`;
}

// ============ API Server ============
const PORT = process.env.PORT || 8080;

const server = http.createServer(async (req, res) => {

  // ===== صفحة الـ QR Code =====
  if (req.url === '/qr' || req.url === '/qr/') {
    const html = generateQRHtml(currentQR, botConnected, qrGeneratedAt);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(html);
    return;
  }

  // ===== API endpoints =====
  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({
      status: 'ok',
      connected: botConnected,
      qrReady: !!currentQR,
      uptime: Math.floor(process.uptime()),
      pid: process.pid
    }));
    return;
  }

  if (req.url === '/customers') {
    const data = loadData();
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ count: Object.keys(data.customers).length, customers: data.customers }));
    return;
  }

  if (req.url === '/codes') {
    const data = loadData();
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ codes: data.codes, masterCodes: data.masterCodes }));
    return;
  }

  // Default
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({
    status: 'ok',
    connected: botConnected,
    qrReady: !!currentQR,
    bot: 'OptiSize v4.1 QR',
    qrUrl: '/qr'
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`API شغال على بورت ${PORT}`);
  console.log(`صفحة QR: http://localhost:${PORT}/qr`);

  setTimeout(async () => {
    try {
      await startBot();
    } catch (err) {
      console.error('فشل تشغيل البوت:', err.message);
    }
  }, 10000);
});

// ============ WhatsApp Bot (QR Code Method) ============
async function startBot() {
  console.log('جاري تشغيل بوت واتساب (طريقة QR Code)...');

  const authPath = path.join(__dirname, 'auth_info');

  // حذف أي جلسة قديمة عشان نبدأ بـ QR جديد
  try {
    if (fs.existsSync(authPath)) {
      fs.rmSync(authPath, { recursive: true, force: true });
      console.log('تم حذف auth_info القديم - هيظهر QR جديد');
    }
  } catch (e) {
    console.log('مش قادر أحذف auth_info:', e.message);
  }

  try {
    const { version } = await fetchLatestBaileysVersion();
    console.log(`Baileys version: ${version.join('.')}`);

    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    sock = makeWASocket({
      version,
      auth: state,
      logger: P({ level: 'silent' }),
      printQRInTerminal: true,
      browser: ['OptiSize Bot', 'Chrome', '4.1'],
      markOnlineOnConnect: true,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 30000,
      generateHighQualityLinkPreview: false,
      emitOwnEvents: false,
    });

    sock.ev.on('creds.update', saveCreds);

    // ============ تحديث الاتصال ============
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        botConnected = false;
        currentQR = qr;
        qrGeneratedAt = Date.now();

        console.log('');
        console.log('========== QR CODE ==========');
        console.log('افتح الرابط ده في المتصفح وامسح الكود:');
        console.log(`https://optisizebot-9mfp0omc.b4a.run/qr`);
        console.log('==============================');
        console.log('');
      }

      if (connection === 'close') {
        botConnected = false;
        currentQR = null;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.log('الاتصال اتقفل. Status:', statusCode);

        if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
          console.log('الجلسة انتهت. لازم نربط تاني بـ QR جديد...');
          try {
            if (fs.existsSync(authPath)) {
              fs.rmSync(authPath, { recursive: true, force: true });
            }
          } catch (e) {}
          setTimeout(startBot, 10000);

        } else if (statusCode === 405) {
          console.log('محظور 405 - هنحاول نربط بـ QR جديد...');
          try {
            if (fs.existsSync(authPath)) {
              fs.rmSync(authPath, { recursive: true, force: true });
            }
          } catch (e) {}
          setTimeout(startBot, 30000);

        } else {
          console.log('إعادة محاولة الاتصال بعد 5 ثواني...');
          setTimeout(startBot, 5000);
        }
      }

      if (connection === 'open') {
        botConnected = true;
        currentQR = null;
        console.log('بوت واتساب اشتغل بنجاح!');
        console.log(`الرقم المربوط: ${PAYMENT_NUMBER}`);

        try {
          await sock.sendPresenceUpdate('available');
        } catch (e) {}
      }
    });

    // ============ استقبال الرسائل ============
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        const m = messages[0];
        if (!m || !m.message) return;
        if (m.key.fromMe) return;

        const from = m.key.remoteJid;

        if (from.endsWith('@g.us') || from.endsWith('@newsletter')) return;

        if (type !== 'notify' && type !== 'append') return;

        let phone = from.replace('@s.whatsapp.net', '').replace('@lid', '');

        const text = m.message?.conversation
          || m.message?.extendedTextMessage?.text
          || m.message?.imageMessage?.caption
          || '';

        console.log(`رسالة من ${phone}: ${text || '[صورة]'}`);

        try { await sock.readMessages([m.key]); } catch (e) {}
        try { await sock.sendPresenceUpdate('composing', from); } catch (e) {}
        await new Promise(r => setTimeout(r, 1500));

        // ============ وضع التحدث مع الدعم ============
        if (ownerChatActive[phone]) {
          if (text.trim() === 'انتهى' || text.trim() === 'انهى' || text.trim() === 'خلاص') {
            ownerChatActive[phone] = false;
            await safeSend(from, { text: 'تم إنهاء محادثة الدعم. شكراً!\n\nلو محتاج حاجة تاني ابعت رسالة.' });
          }
          return;
        }

        // ============ صورة (إيصال دفع) ============
        if (m.message?.imageMessage) {
          if (userStates[phone] === 'awaiting_receipt') {
            await handleReceipt(from, phone, m);
          } else {
            await safeSend(from, { text: WELCOME_MSG });
          }
          try { await sock.sendPresenceUpdate('available'); } catch (e) {}
          return;
        }

        // ============ أوامر نصية ============
        const cmd = text.trim();

        if (cmd === '1' || cmd === 'اشتراك' || cmd === 'اشترك') {
          userStates[phone] = 'awaiting_receipt';
          await safeSend(from, { text: SUB_INFO_MSG });

        } else if (cmd.startsWith('2') || cmd.startsWith('كود') || cmd.startsWith('code')) {
          const codeInput = cmd.replace(/^(2|كود|code)\s*/i, '').trim().toUpperCase();
          if (!codeInput) {
            await safeSend(from, { text: 'ابعت الكود بعد كلمة كود\n\nمثال:\nكود SIZE2026\nكود OPT-ABC123' });
          } else {
            const result = verifyCode(codeInput, phone);
            await safeSend(from, { text: result.message });
          }

        } else if (cmd === '3' || cmd === 'حالتي' || cmd === 'حالة') {
          if (isCustomerSubscribed(phone)) {
            const data = loadData();
            const customer = data.customers[phone];
            const latest = customer.subscriptions[customer.subscriptions.length - 1];
            const expiry = new Date(latest.expiresAt).toLocaleDateString('ar-EG');
            await safeSend(from, {
              text: `انت مشترك!\nينتهي في: ${expiry}\nالكود: ${latest.code}`
            });
          } else {
            await safeSend(from, {
              text: `انت مش مشترك\n\nاشترك بـ 50 جنيه شهرياً\nحول على: ${PAYMENT_NUMBER}\n\nأو استخدم كود اشتراك`
            });
          }

        } else if (cmd === '4' || cmd === 'تحدث' || cmd === 'دعم') {
          ownerChatActive[phone] = true;
          await safeSend(from, {
            text: 'تم تحويلك لفريق الدعم.\n\nاكتب رسالتك وهيردوا عليك.\nلإنهاء المحادثة أرسل: انتهى'
          });

        } else {
          await safeSend(from, { text: WELCOME_MSG });
        }

        try { await sock.sendPresenceUpdate('available'); } catch (e) {}

      } catch (err) {
        console.error('Handler error:', err.message);
      }
    });

  } catch (err) {
    console.error('فشل تشغيل البوت:', err.message);
    setTimeout(startBot, 15000);
  }
}

// ============ معالجة الأخطاء ============
process.on('uncaughtException', (err) => {
  console.error('Uncaught:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('Rejection:', reason instanceof Error ? reason.message : String(reason));
});

console.log('OptiSize Bot v4.1 QR - Starting...');
console.log(`Payment Number: ${PAYMENT_NUMBER}`);
console.log(`Required Amount: ${REQUIRED_AMOUNT} EGP`);
console.log(`Master Codes: ${Object.keys(MASTER_CODES).join(', ')}`);
console.log(`QR Page: /qr`);
console.log('-----------------------------------');
