import makeWASocket from '@whiskeysockets/baileys';
import { useMultiFileAuthState } from '@whiskeysockets/baileys';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============ الإعدادات ============
const OWNER_NUMBER = '201028900122';
const PAYMENT_NUMBER = '01028900122';
const SUBSCRIPTION_PRICE = 50;
const SUBSCRIPTION_DURATION_DAYS = 30;

const GROQ_API_KEY = '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';
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// التطبيقات المعتمدة + ألوانها المعروفة
const APP_PROFILES = {
  'فودافون': { keywords: ['فودافون', 'vodafone', 'vod'], colors: ['أحمر', 'red'] },
  'إنستاباي': { keywords: ['إنستاباي', 'instapay'], colors: ['أزرق', 'بنفسجي', 'blue', 'purple'] },
  'أورانج': { keywords: ['أورانج', 'orange'], colors: ['برتقالي', 'orange'] },
  'إثبات': { keywords: ['إثبات', 'etby'], colors: ['أخضر', 'green'] },
  'بنك مصر': { keywords: ['بنك مصر', 'banque misr', 'bm'], colors: ['أزرق', 'blue', 'أحمر', 'red'] },
  'بنك الأهلي': { keywords: ['بنك الأهلي', 'بنك الاهلي', 'nbe', 'national bank'], colors: ['أزرق', 'blue', 'أخضر', 'green'] },
  'بنك القاهرة': { keywords: ['بنك القاهرة', 'cairo bank'], colors: ['أزرق', 'blue'] },
  'cib': { keywords: ['cib'], colors: ['أزرق', 'blue'] },
  'راحي': { keywords: ['راحي', 'rahi'], colors: ['أزرق', 'blue'] },
  'نقد': { keywords: ['نقد', 'naqd'], colors: ['أخضر', 'green'] },
};

// ============ ملفات البيانات ============
const SUBS_FILE = path.join(__dirname, 'subscriptions.json');
const CODES_FILE = path.join(__dirname, 'subscription_codes.json');
const USED_RECEIPTS_FILE = path.join(__dirname, 'used_receipts.json');

function loadJSON(file) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) { console.error('خطأ في تحميل:', file, e.message); }
  return {};
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

function loadSubscriptions() { return loadJSON(SUBS_FILE); }
function saveSubscriptions(subs) { saveJSON(SUBS_FILE, subs); }
function loadCodes() { return loadJSON(CODES_FILE); }
function saveCodes(codes) { saveJSON(CODES_FILE, codes); }
function loadUsedReceipts() { return loadJSON(USED_RECEIPTS_FILE); }
function saveUsedReceipts(data) { saveJSON(USED_RECEIPTS_FILE, data); }

function isSubscribed(jid) {
  const subs = loadSubscriptions();
  const sub = subs[jid];
  if (!sub) return false;
  if (new Date(sub.expiry) < new Date()) {
    delete subs[jid];
    saveSubscriptions(subs);
    return false;
  }
  return true;
}

function activateSubscription(jid) {
  const subs = loadSubscriptions();
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + SUBSCRIPTION_DURATION_DAYS);
  subs[jid] = { activated: new Date().toISOString(), expiry: expiry.toISOString() };
  saveSubscriptions(subs);
  return expiry;
}

function redeemCode(jid, code) {
  const codes = loadCodes();
  if (!codes[code]) return { success: false, message: '❌ الكود غير صحيح' };
  if (codes[code].used) return { success: false, message: '❌ الكود ده تم استخدامه قبل كده' };
  codes[code].used = true;
  codes[code].usedBy = jid;
  codes[code].usedAt = new Date().toISOString();
  saveCodes(codes);
  const expiry = activateSubscription(jid);
  return { success: true, message: `✅ تم تفعيل الاشتراك!\n📅 ينتهي في: ${expiry.toLocaleDateString('ar-EG')}` };
}

// ============ تتبع الإيصالات المستخدمة ============
function isReceiptUsed(receiptNumber) {
  if (!receiptNumber || receiptNumber === 'غير محدد') return false;
  const used = loadUsedReceipts();
  const key = receiptNumber.toString().trim().toLowerCase();
  return !!used[key];
}

function markReceiptUsed(receiptNumber, jid) {
  if (!receiptNumber || receiptNumber === 'غير محدد') return;
  const used = loadUsedReceipts();
  const key = receiptNumber.toString().trim().toLowerCase();
  used[key] = { usedBy: jid, usedAt: new Date().toISOString() };
  saveUsedReceipts(used);
}

// ============ فحص التطبيق المعتمد ============
function findAppProfile(appName) {
  if (!appName || appName === 'غير محدد' || appName === 'لا' || appName === 'مش واضح') return null;
  const lower = appName.toLowerCase();
  for (const [name, profile] of Object.entries(APP_PROFILES)) {
    if (profile.keywords.some(k => lower.includes(k.toLowerCase()))) {
      return { name, ...profile };
    }
  }
  return null;
}

// ============ التاريخ والوقت ============
function getEgyptDateString() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
}
function getEgyptTimeString() {
  return new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' });
}

// ============ الطلب الأول: استخراج البيانات + وصف بصري ============
async function extractReceiptData(imageBuffer, mimeType) {
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Image}`;
  const today = getEgyptDateString();
  const currentTime = getEgyptTimeString();

  const prompt = `أنت خبير في تحليل إيصالات الدفع الإلكتروني المصرية. حلل الصورة بدقة واستخرج:

1. TYPE: نوع المستند (إيصال/تحويل/إشعار دفع/إشعار استلام/سند/عرض سعر/إعلان/صورة عادية/غير ذلك)
2. KEYWORD: هل فيه أي من: إيصال، تحويل، دفع، استلام، إشعار، سند، receipt، transfer؟ (نعم/لا)
3. APP_NAME: اسم التطبيق أو المحفظة اللي أصدرت الإيصال. محدد جداً: "فودافون كاش" أو "إنستاباي" أو "أورانج كاش" إلخ. لو مش واضح خالص قول "غير محدد".
4. SENDER_NUMBER: رقم المرسل (لو موجود)
5. RECEIVER_NUMBER: رقم المستلم (لو موجود)
6. AMOUNT: المبلغ بالأرقام فقط
7. DATE: التاريخ بصيغة YYYY-MM-DD (لو مش واضح اكتب "غير محدد")
8. TIME: الوقت بصيغة HH:MM (لو مش واضح اكتب "غير محدد")
9. RECEIPT_NUMBER: رقم الإيصال أو المرجع (لو موجود)
10. DOMINANT_COLORS: الألوان الرئيسية في الصورة (مثلاً: أحمر وأبيض، أزرق وأبيض)
11. HAS_STATUS_BAR: هل يوجد شريط حالة الهاتف في أعلى الصورة؟ (نعم/لا)
12. HAS_NAVIGATION_BAR: هل يوجد شريط تنقل في أسفل الصورة؟ (نعم/لا)
13. LOOKS_LIKE_SCREENSHOT: هل الصورة تبدو كسكرين شوت من تطبيق موبايل حقيقي؟ (نعم/لا)

أجب بصيغة JSON فقط:
{
  "TYPE": "إيصال",
  "KEYWORD": "نعم",
  "APP_NAME": "فودافون كاش",
  "SENDER_NUMBER": "01012345678",
  "RECEIVER_NUMBER": "01028900122",
  "AMOUNT": 50,
  "DATE": "${today}",
  "TIME": "14:30",
  "RECEIPT_NUMBER": "TXN123456",
  "DOMINANT_COLORS": "أحمر وأبيض",
  "HAS_STATUS_BAR": "نعم",
  "HAS_NAVIGATION_BAR": "نعم",
  "LOOKS_LIKE_SCREENSHOT": "نعم"
}

التاريخ: ${today}
الوقت: ${currentTime}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: dataUrl } }
        ]}],
        temperature: 0.1,
        max_tokens: 800
      })
    });

    const result = await response.json();
    if (!result.choices || !result.choices[0]) {
      console.error('Groq extract error:', JSON.stringify(result));
      return null;
    }

    let content = result.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) { console.error('No JSON:', content); return null; }

    const data = JSON.parse(jsonMatch[0]);
    console.log('📋 Extract:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Extract error:', error.message);
    return null;
  }
}

// ============ الطلب الثاني: فحص التزوير المركز ============
async function fraudCheck(imageBuffer, mimeType, extractedData) {
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Image}`;
  const appName = extractedData.APP_NAME || 'غير محدد';

  const prompt = `أنت خبير كشف تزوير في الإيصالات الإلكترونية المصرية.

شخص ادعى إن الإيصال ده من تطبيق "${appName}".

افحص الصورة بدقة وأجب على الأسئلة دي:

1. REAL_APP: هل ده فعلاً سكرين شوت من تطبيق "${appName}" الحقيقي؟ (نعم/لا/مش متأكد)
2. FAKE_SIGNS: هل فيه أي من العلامات دي؟
   أ) علامة مائية أو اسم أداة إنشاء إيصالات (Receipt Maker, Fake Receipt)
   ب) تصميم عام مش مرتبط بتطبيق حقيقي معروف
   ج) نص مضاف أو معدل بشكل واضح (خط مختلف، حجم مختلف، لون مختلف)
   د) الإيصال مكتوب بالإنجليزي بس بدون أي عربي
   هـ) مفيش أي عناصر واجهة مستخدم للتطبيق (أزرار، قوائم، شريط تنقل)
   (اكتب أرقام العلامات اللي موجودة، أو "لا توجد")
3. GENUINE_SCORE: من 1 لـ 10، قد إيه متأكد إن الإيصال حقيقي؟
4. REASON: السبب الرئيسي لتقييمك

أجب بصيغة JSON فقط:
{
  "REAL_APP": "نعم",
  "REAL_APP_REASON": "التصميم والألوان متطابقة",
  "FAKE_SIGNS": "لا توجد",
  "GENUINE_SCORE": 9,
  "REASON": "الإيصال حقيقي من تطبيق فودافون كاش"
}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'أنت خبير كشف تزوير محترف. كتير من الناس بيحاولوا يبعتوا إيصالات وهمية. لازم تكون حذر جداً وبتكشف أي إيصال وهمي. الإيصالات الحقيقية لازم تقبلها.' },
          { role: 'user', content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]}
        ],
        temperature: 0.1,
        max_tokens: 600
      })
    });

    const result = await response.json();
    if (!result.choices || !result.choices[0]) {
      console.error('Fraud check error:', JSON.stringify(result));
      return null;
    }

    let content = result.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) { console.error('No JSON fraud:', content); return null; }

    const data = JSON.parse(jsonMatch[0]);
    console.log('🔍 Fraud Check:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Fraud check error:', error.message);
    return null;
  }
}

// ============ التحقق البرمجي الشامل ============
function verifyReceipt(extracted, fraudResult) {
  const today = getEgyptDateString();
  const results = [];
  let passed = true;
  let warnings = 0;

  // 1. نوع المستند
  const validTypes = ['إيصال', 'تحويل', 'إشعار دفع', 'إشعار استلام', 'إشعار', 'سند'];
  const typeOk = validTypes.some(t => (extracted.TYPE || '').includes(t));
  if (!typeOk) { results.push('❌ المستند مش إيصال دفع'); passed = false; }
  else results.push('✅ نوع المستند صحيح');

  // 2. كلمة مفتاحية
  const keywordOk = extracted.KEYWORD === 'نعم';
  if (!keywordOk) { results.push('❌ مفيش كلمة دفع أو تحويل'); passed = false; }
  else results.push('✅ فيه كلمة مفتاحية');

  // 3. التطبيق معتمد
  const appProfile = findAppProfile(extracted.APP_NAME);
  if (!appProfile) { results.push(`❌ التطبيق "${extracted.APP_NAME}" مش معروف`); passed = false; }
  else results.push(`✅ التطبيق: ${appProfile.name}`);

  // 4. رقم المستلم
  const receiverNum = String(extracted.RECEIVER_NUMBER || '').replace(/\s/g, '');
  const numberOk = receiverNum.includes(PAYMENT_NUMBER) || receiverNum.includes('2' + PAYMENT_NUMBER);
  if (!numberOk) { results.push(`❌ رقم المستلم (${receiverNum}) غلط`); passed = false; }
  else results.push('✅ رقم المستلم صح');

  // 5. المبلغ
  const amount = parseFloat(extracted.AMOUNT);
  const amountOk = amount === SUBSCRIPTION_PRICE;
  if (!amountOk) { results.push(`❌ المبلغ (${amount}) مش ${SUBSCRIPTION_PRICE}`); passed = false; }
  else results.push(`✅ المبلغ: ${SUBSCRIPTION_PRICE} جنيه`);

  // 6. التاريخ
  const dateOk = extracted.DATE === today;
  if (!dateOk) { results.push(`❌ التاريخ (${extracted.DATE}) مش اليوم`); passed = false; }
  else results.push('✅ التاريخ صح');

  // 7. شريط حالة
  const hasStatusBar = extracted.HAS_STATUS_BAR === 'نعم';
  if (!hasStatusBar) { results.push('⚠️ مفيش شريط حالة'); warnings++; }
  else results.push('✅ فيه شريط حالة');

  // 8. سكرين شوت
  const looksLikeScreenshot = extracted.LOOKS_LIKE_SCREENSHOT === 'نعم';
  if (!looksLikeScreenshot) { results.push('⚠️ مش شكل سكرين شوت'); warnings++; }
  else results.push('✅ تبدو كسكرين شوت');

  // 9. الألوان
  if (appProfile) {
    const colors = (extracted.DOMINANT_COLORS || '').toLowerCase();
    const colorMatch = appProfile.colors.some(c => colors.includes(c.toLowerCase()));
    if (!colorMatch) { results.push(`⚠️ الألوان مش زي ${appProfile.name}`); warnings++; }
    else results.push(`✅ الألوان تطابق ${appProfile.name}`);
  }

  // 10-12. فحص التزوير
  if (fraudResult) {
    const realApp = fraudResult.REAL_APP === 'نعم';
    if (!realApp) { results.push(`❌ مش من التطبيق الحقيقي: ${fraudResult.REAL_APP_REASON || ''}`); passed = false; }
    else results.push('✅ من التطبيق الحقيقي');

    const fakeSigns = String(fraudResult.FAKE_SIGNS || '').trim();
    const hasFake = fakeSigns !== '' && fakeSigns !== 'لا توجد' && fakeSigns !== 'لا' && fakeSigns !== 'none' && fakeSigns !== 'غير موجودة';
    if (hasFake) { results.push(`❌ علامات تزوير: ${fakeSigns}`); passed = false; }
    else results.push('✅ مفيش علامات تزوير');

    const score = parseInt(fraudResult.GENUINE_SCORE) || 5;
    if (score < 5) { results.push(`❌ درجة أصالة ضعيفة (${score}/10)`); passed = false; }
    else if (score < 7) { results.push(`⚠️ درجة أصالة متوسطة (${score}/10)`); warnings++; }
    else results.push(`✅ درجة أصالة عالية (${score}/10)`);
  } else {
    results.push('⚠️ فشل فحص التزوير');
    warnings++;
  }

  // 13. إعادة استخدام
  if (extracted.RECEIPT_NUMBER && extracted.RECEIPT_NUMBER !== 'غير محدد') {
    if (isReceiptUsed(extracted.RECEIPT_NUMBER)) { results.push('❌ الإيصال ده تم استخدامه قبل كده!'); passed = false; }
    else results.push('✅ رقم الإيصال جديد');
  }

  // قرار التحذيرات
  if (warnings >= 3 && passed) { passed = false; }
  else if (warnings >= 2 && passed) { passed = false; }

  return { passed, results, warnings, extracted, fraudResult };
}

// ============ رسائل البوت ============
const WELCOME_MSG = `مرحباً بك في OptiSize! 👋

للاشتراك في الخدمة المميزة (50 جنيه/شهر):

1️⃣ حول 50 جنيه على الرقم: ${PAYMENT_NUMBER}
2️⃣ افتح تطبيق الدفع وسكرين شوت الإيصال
3️⃣ ابعت الصورة هنا

⚠️ لازم الإيصال يكون سكرين شوت من التطبيق مباشرة

أو استخدم كود اشتراك (ابعت: كود XXXXX)
للمساعدة ابعت: مساعدة`;

const HELP_MSG = `📋 أوامر OptiSize:

🔹 ابعت صورة الإيصال - للتحقق والاشتراك
🔹 كود XXXXX - لتفعيل كود اشتراك
🔹 حالتي - معرفة حالة اشتراكك
🔹 مساعدة - عرض هذه الرسالة

💰 سعر الاشتراك: ${SUBSCRIPTION_PRICE} جنيه/شهر
📱 رقم التحويل: ${PAYMENT_NUMBER}`;

// ============ البوت الرئيسي ============
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    browser: ['OptiSize-Bot', 'Chrome', '1.0'],
    markOnlineOnConnect: true,
    connectTimeoutMs: 60000,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
      console.log('\n📱 امسح QR Code من الرابط ده:');
      console.log(qrUrl);
      console.log('');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== 401;
      console.log('اتصال مقفول:', statusCode, 'إعادة الاتصال:', shouldReconnect);

      if (statusCode === 401) {
        console.log('⚠️ الجلسة انتهت! امسح مجلد auth_info واعمل ربط جديد');
        if (fs.existsSync('./auth_info')) {
          fs.rmSync('./auth_info', { recursive: true, force: true });
        }
      }

      if (shouldReconnect) {
        setTimeout(() => startBot(), 5000);
      }
    }

    if (connection === 'open') {
      console.log('✅ البوت اشتغل بنجاح!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      if (!msg.message) continue;

      const jid = msg.key.remoteJid;
      const sender = jid.replace('@s.whatsapp.net', '');
      const isGroup = jid.includes('@g.us');
      if (isGroup) continue;

      const imageMsg = msg.message?.imageMessage;
      const textMsg = msg.message?.conversation ||
                      msg.message?.extendedTextMessage?.text || '';

      // أوامر نصية
      if (textMsg && !imageMsg) {
        const cmd = textMsg.trim();

        if (cmd === 'مساعدة' || cmd === 'المساعدة' || cmd === 'help') {
          await sock.sendMessage(jid, { text: HELP_MSG });
          continue;
        }

        if (cmd === 'حالتي' || cmd === 'حالة') {
          if (isSubscribed(jid)) {
            const subs = loadSubscriptions();
            const expiry = new Date(subs[jid].expiry).toLocaleDateString('ar-EG');
            await sock.sendMessage(jid, { text: `✅ انت مشترك!\n📅 ينتهي في: ${expiry}` });
          } else {
            await sock.sendMessage(jid, { text: '❌ انت مش مشترك\n💰 ابعت 50 جنيه على ' + PAYMENT_NUMBER + ' وابعت الإيصال' });
          }
          continue;
        }

        if (cmd.startsWith('كود ') || cmd.startsWith('code ')) {
          const code = cmd.replace(/^(كود|code)\s+/i, '').trim().toUpperCase();
          const result = redeemCode(jid, code);
          await sock.sendMessage(jid, { text: result.message });
          continue;
        }

        if (cmd.includes('مرحبا') || cmd.includes('هاي') || cmd.includes('اهلا') || cmd.includes('السلام')) {
          await sock.sendMessage(jid, { text: WELCOME_MSG });
          continue;
        }

        await sock.sendMessage(jid, { text: WELCOME_MSG });
        continue;
      }

      // صورة الإيصال
      if (imageMsg) {
        try {
          await sock.sendMessage(jid, { text: '🔍 جاري التحقق من الإيصال (فحص مزدوج)...' });

          const stream = await sock.downloadMediaMessage(msg, 'buffer');

          if (!stream || stream.length === 0) {
            await sock.sendMessage(jid, { text: '❌ مش قادر أحمل الصورة. حاول تاني.' });
            continue;
          }

          const mimeType = imageMsg.mimetype || 'image/jpeg';

          // الطبقة 1: استخراج البيانات
          const extracted = await extractReceiptData(stream, mimeType);

          if (!extracted) {
            await sock.sendMessage(jid, { text: '❌ حصل خطأ في تحليل الإيصال. حاول تاني.' });
            continue;
          }

          // فحص سريع
          const quickCheck = findAppProfile(extracted.APP_NAME) !== null;
          const receiverNum = String(extracted.RECEIVER_NUMBER || '').replace(/\s/g, '');
          const numberOk = receiverNum.includes(PAYMENT_NUMBER) || receiverNum.includes('2' + PAYMENT_NUMBER);
          const amountOk = parseFloat(extracted.AMOUNT) === SUBSCRIPTION_PRICE;

          let fraudResult = null;

          // الطبقة 2: فحص التزوير (فقط لو البيانات الأساسية صح)
          if (quickCheck && numberOk && amountOk) {
            await sock.sendMessage(jid, { text: '🔎 فحص إضافي للتأكد من صحة الإيصال...' });
            fraudResult = await fraudCheck(stream, mimeType, extracted);
          }

          // الطبقة 3: التحقق الشامل
          const verification = verifyReceipt(extracted, fraudResult);

          console.log(`\n📋 === ${sender} ===`);
          verification.results.forEach(r => console.log('  ', r));
          console.log('  النتيجة:', verification.passed ? '✅ مقبول' : '❌ مرفوض');

          if (verification.passed) {
            if (extracted.RECEIPT_NUMBER && extracted.RECEIPT_NUMBER !== 'غير محدد') {
              markReceiptUsed(extracted.RECEIPT_NUMBER, jid);
            }

            const expiry = activateSubscription(jid);
            const expiryStr = expiry.toLocaleDateString('ar-EG');

            await sock.sendMessage(jid, {
              text: `✅ تم التحقق من الإيصال بنجاح!\n\n🎫 تم تفعيل اشتراكك في OptiSize Premium\n📅 ينتهي في: ${expiryStr}\n\nشكراً ليك! 🎉`
            });

            try {
              await sock.sendMessage(OWNER_NUMBER + '@s.whatsapp.net', {
                text: `📥 اشتراك جديد!\n👤 ${sender}\n💰 ${SUBSCRIPTION_PRICE} جنيه\n📱 ${extracted.APP_NAME}\n📄 ${extracted.RECEIPT_NUMBER || '-'}\n📅 ${expiryStr}`
              });
            } catch (e) {}

          } else {
            const reasons = verification.results.filter(r => r.startsWith('❌')).join('\n');
            const warns = verification.results.filter(r => r.startsWith('⚠️')).join('\n');

            let rejectMsg = `❌ الإيصال مرفوض!\n\n`;
            if (reasons) rejectMsg += `${reasons}\n\n`;
            if (warns) rejectMsg += `⚠️ تحذيرات:\n${warns}\n\n`;
            rejectMsg += `تأكد إنك:\n- بعت سكرين شوت من التطبيق مباشرة\n- المبلغ 50 جنيه\n- التحويل على ${PAYMENT_NUMBER}\n- الإيصال من اليوم\n\nلو المشكلة مستمرة، تواصل مع الدعم.`;

            await sock.sendMessage(jid, { text: rejectMsg });

            try {
              await sock.sendMessage(OWNER_NUMBER + '@s.whatsapp.net', {
                text: `🚫 محاولة مرفوضة!\n👤 ${sender}\n📋 ${reasons}\n📱 التطبيق: ${extracted.APP_NAME || 'غير محدد'}`
              });
            } catch (e) {}
          }

        } catch (error) {
          console.error('Error processing receipt:', error);
          await sock.sendMessage(jid, { text: '❌ حصل خطأ. حاول تاني.' });
        }
      }
    }
  });

  return sock;
}

// ============ تشغيل البوت ============
console.log('🤖 OptiSize Bot v2 - Starting...');
console.log(`💰 Subscription: ${SUBSCRIPTION_PRICE} EGP/month`);
console.log(`📱 Payment Number: ${PAYMENT_NUMBER}`);
console.log(`👑 Owner: ${OWNER_NUMBER}`);
console.log('-----------------------------------');

startBot().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
