import makeWASocket from '@whiskeysockets/baileys';
import { useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
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

// التطبيقات المعتمدة في مصر للدفع
const RECOGNIZED_PAYMENT_APPS = [
  'فودافون', 'vodafone',
  'إنستاباي', 'instapay',
  'أورانج', 'orange',
  'إثبات', 'etby',
  'بنك مصر', 'banque misr',
  'بنك الأهلي', 'بنك الاهلي', 'national bank', 'nbe',
  'cib',
  'بنك القاهرة', 'bank of cairo',
  'راحي', 'rahi',
  'نقد', 'naqd',
  'أبي', 'aby',
  'البنك العربي', 'arab bank',
  'qnb',
  'bm',
  'سعودي', 'stc',
];

// ============ ملف الاشتراكات ============
const SUBS_FILE = path.join(__dirname, 'subscriptions.json');
const CODES_FILE = path.join(__dirname, 'subscription_codes.json');

function loadSubscriptions() {
  try {
    if (fs.existsSync(SUBS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('خطأ في تحميل الاشتراكات:', e.message);
  }
  return {};
}

function saveSubscriptions(subs) {
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2), 'utf-8');
}

function loadCodes() {
  try {
    if (fs.existsSync(CODES_FILE)) {
      return JSON.parse(fs.readFileSync(CODES_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('خطأ في تحميل الأكواد:', e.message);
  }
  return {};
}

function saveCodes(codes) {
  fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2), 'utf-8');
}

function isSubscribed(jid) {
  const subs = loadSubscriptions();
  const sub = subs[jid];
  if (!sub) return false;
  const expiry = new Date(sub.expiry);
  if (expiry < new Date()) {
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
  subs[jid] = {
    activated: new Date().toISOString(),
    expiry: expiry.toISOString()
  };
  saveSubscriptions(subs);
  return expiry;
}

function generateCode() {
  const codes = loadCodes();
  const code = 'VIP-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  codes[code] = { created: new Date().toISOString(), used: false };
  saveCodes(codes);
  return code;
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
  return { success: true, message: `✅ تم تفعيل الاشتراك بنجاح!\n📅 ينتهي في: ${expiry.toLocaleDateString('ar-EG')}`, expiry };
}

// ============ فحص التطبيق المعتمد ============
function isRecognizedApp(appName) {
  if (!appName || appName === 'غير محدد' || appName === 'لا' || appName === 'مش واضح') return false;
  const lower = appName.toLowerCase();
  return RECOGNIZED_PAYMENT_APPS.some(app => lower.includes(app.toLowerCase()));
}

// ============ التاريخ والوقت ============
function getEgyptDateString() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }); // YYYY-MM-DD
}

function getYesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
}

function getEgyptTimeString() {
  return new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' });
}

// ============ تحليل الإيصال بالذكاء الاصطناعي ============
async function analyzeReceipt(imageBuffer, mimeType) {
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  const today = getEgyptDateString();
  const yesterday = getYesterdayDateString();
  const currentTime = getEgyptTimeString();

  const EXTRACT_AND_CHECK_PROMPT = `أنت خبير في تحليل إيصالات الدفع الإلكتروني المصرية. حلل الصورة المرفقة بدقة واستخرج البيانات التالية:

1. TYPE: نوع المستند (إيصال/تحويل/إشعار دفع/إشعار استلام/سند/عرض سعر/إعلان/غير ذلك)
2. KEYWORD: هل يحتوي على أي من الكلمات: إيصال، تحويل، دفع، استلام، إشعار، سند، receipt، transfer؟ (نعم/لا)
3. APP_NAME: اسم التطبيق أو المحفظة أو البنك الذي أصدر الإيصال. يجب أن تكون محدد جداً - مثلاً: "فودافون كاش" أو "إنستاباي" أو "أورانج كاش" أو "إثبات" إلخ. لو مش واضح قول "غير محدد".
4. SENDER_NAME: اسم المرسل (لو موجود)
5. SENDER_NUMBER: رقم هاتف المرسل (لو موجود)
6. RECEIVER_NAME: اسم المستلم (لو موجود)
7. RECEIVER_NUMBER: رقم هاتف المستلم أو رقم الحساب المستلم (لو موجود)
8. AMOUNT: المبلغ بالأرقام فقط (بدون نص أو عملة)
9. CURRENCY: العملة (جنيه/EGP/غير ذلك)
10. DATE: تاريخ العملية بصيغة YYYY-MM-DD (لو مش واضح اكتب "غير محدد")
11. TIME: وقت العملية بصيغة HH:MM بصيغة 24 ساعة (لو مش واضح اكتب "غير محدد")
12. RECEIPT_NUMBER: رقم الإيصال أو المرجع (لو موجود)
13. METHOD: طريقة الدفع (محفظة إلكترونية/تحويل بنكي/فوري/غير ذلك)

ثم تحقق مما يلي:

14. FAKE_INDICATORS: هل توجد أي علامات واضحة تدل على أن الإيصال وهمي أو مزور؟ افحص الآتي بدقة:
    - هل واجهة التطبيق في الصورة لا تتطابق مع واجهة التطبيق الحقيقي المعروف في مصر؟ (مثلاً: لو مكتوب فودافون كاش بس التصميم مش زي تطبيق فودافون كاش الحقيقي)
    - هل توجد علامة مائية أو اسم تطبيق إنشاء إيصالات وهمية؟ (مثل: Receipt Maker، Fake Receipt، إيصال وهمي، إلخ)
    - هل يوجد تعديل واضح على الصورة؟ (نص مضاف بشكل واضح، خط مختلف، ألوان غير متسقة)
    - هل الإيصال يبدو كأنه من تطبيق عام/جامد مش من تطبيق دفع حقيقي معروف؟
    
    مهم: لا تقول إن الإيصال وهمي لمجرد الشك. قول "لا توجد" فقط لو متأكد إن فيه علامات واضحة للتزوير. السبب وراء رفضك إذا رفضت: اذكر السبب بالتحديد.

15. APP_CONFIDENCE: مدى ثقتك إن الإيصال فعلاً من تطبيق دفع حقيقي معروف في مصر (HIGH/MEDIUM/LOW)

أجب بصيغة JSON فقط بدون أي نص إضافي قبل أو بعد JSON. مثال:
{
  "TYPE": "إيصال",
  "KEYWORD": "نعم",
  "APP_NAME": "فودافون كاش",
  "SENDER_NAME": "أحمد محمد",
  "SENDER_NUMBER": "01012345678",
  "RECEIVER_NAME": "محمد علي",
  "RECEIVER_NUMBER": "01028900122",
  "AMOUNT": 50,
  "CURRENCY": "جنيه",
  "DATE": "${today}",
  "TIME": "14:30",
  "RECEIPT_NUMBER": "TXN123456",
  "METHOD": "محفظة إلكترونية",
  "FAKE_INDICATORS": "لا توجد",
  "APP_CONFIDENCE": "HIGH"
}

التاريخ الحالي في مصر: ${today}
الوقت الحالي في مصر: ${currentTime}`;

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
          {
            role: 'user',
            content: [
              { type: 'text', text: EXTRACT_AND_CHECK_PROMPT },
              { type: 'image_url', image_url: { url: dataUrl } }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    const result = await response.json();
    
    if (!result.choices || !result.choices[0]) {
      console.error('Groq API error:', JSON.stringify(result));
      return null;
    }

    let content = result.choices[0].message.content.trim();
    
    // استخراج JSON من الرد
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response:', content);
      return null;
    }

    const data = JSON.parse(jsonMatch[0]);
    console.log('📝 AI Analysis Result:', JSON.stringify(data, null, 2));
    return data;

  } catch (error) {
    console.error('Error analyzing receipt:', error.message);
    return null;
  }
}

// ============ التحقق البرمجي من الإيصال ============
function verifyReceipt(data) {
  const today = getEgyptDateString();
  const yesterday = getYesterdayDateString();
  const results = [];
  let passed = true;

  // 1. نوع المستند
  const validTypes = ['إيصال', 'تحويل', 'إشعار دفع', 'إشعار استلام', 'إشعار', 'سند'];
  const typeOk = validTypes.some(t => (data.TYPE || '').includes(t));
  if (!typeOk) {
    results.push('❌ المستند مش إيصال دفع');
    passed = false;
  } else {
    results.push('✅ نوع المستند: إيصال دفع');
  }

  // 2. كلمة مفتاحية
  const keywordOk = data.KEYWORD === 'نعم' || data.KEYWORD === 'yes';
  if (!keywordOk) {
    results.push('❌ مفيش كلمة دفع أو تحويل في الإيصال');
    passed = false;
  } else {
    results.push('✅ فيه كلمة مفتاحية');
  }

  // 3. التطبيق معتمد
  const appOk = isRecognizedApp(data.APP_NAME);
  if (!appOk) {
    results.push(`❌ التطبيق "${data.APP_NAME}" مش من التطبيقات المعتمدة في مصر`);
    passed = false;
  } else {
    results.push(`✅ التطبيق: ${data.APP_NAME}`);
  }

  // 4. ثقة التطبيق
  const confidenceOk = data.APP_CONFIDENCE !== 'LOW';
  if (!confidenceOk) {
    results.push('❌ مش متأكد إن الإيصال من تطبيق حقيقي');
    passed = false;
  } else {
    results.push(`✅ مستوى الثقة: ${data.APP_CONFIDENCE}`);
  }

  // 5. رقم المستلم
  const receiverNum = String(data.RECEIVER_NUMBER || '').replace(/\s/g, '');
  const expectedNum = PAYMENT_NUMBER;
  const numberOk = receiverNum.includes(expectedNum) || receiverNum.includes('2' + expectedNum);
  if (!numberOk) {
    results.push(`❌ رقم المستلم (${receiverNum}) مش الرقم المطلوب (${expectedNum})`);
    passed = false;
  } else {
    results.push('✅ رقم المستلم صح');
  }

  // 6. المبلغ
  const amount = parseFloat(data.AMOUNT);
  const amountOk = amount === SUBSCRIPTION_PRICE;
  if (!amountOk) {
    results.push(`❌ المبلغ (${amount} جنيه) مش ${SUBSCRIPTION_PRICE} جنيه`);
    passed = false;
  } else {
    results.push(`✅ المبلغ: ${SUBSCRIPTION_PRICE} جنيه`);
  }

  // 7. التاريخ
  const dateOk = data.DATE === today || data.DATE === yesterday;
  if (!dateOk) {
    results.push(`❌ التاريخ (${data.DATE}) مش اليوم ولا أمس`);
    passed = false;
  } else {
    results.push('✅ التاريخ صحيح');
  }

  // 8. مؤشرات التزوير
  const fakeIndicators = String(data.FAKE_INDICATORS || '').trim();
  const hasFakeIndicators = fakeIndicators !== '' && 
    fakeIndicators !== 'لا' && 
    fakeIndicators !== 'لا توجد' && 
    fakeIndicators !== 'لا يوجد' && 
    fakeIndicators !== 'none' && 
    fakeIndicators !== 'no' &&
    fakeIndicators !== 'غير موجود';
  
  if (hasFakeIndicators) {
    results.push(`❌ مؤشرات تزوير: ${fakeIndicators}`);
    passed = false;
  } else {
    results.push('✅ مفيش مؤشرات تزوير');
  }

  return { passed, results, data };
}

// ============ رسائل البوت ============
const WELCOME_MSG = `مرحباً بك في OptiSize! 👋

للاشتراك في الخدمة المميزة (50 جنيه/شهر):

1️⃣ حول 50 جنيه على الرقم: ${PAYMENT_NUMBER}
2️⃣ ابعت صورة الإيصال هنا
3️⃣ هنتحقق من الإيصال تلقائياً وتفعيل اشتراكك

أو استخدم كود الاشتراك لو عندك واحد (ابعت: كود XXXXX)

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
    printQRInTerminal: true,
    logger: P({ level: 'silent' }),
    browser: ['OptiSize-Bot', 'Chrome', '1.0'],
    markOnlineOnConnect: true,
    connectTimeoutMs: 60000,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      // عرض رابط QR Code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
      console.log('\n📱 امسح QR Code من الرابط ده:');
      console.log(qrUrl);
      console.log('');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== 401;
      console.log('اتصال مقفول، كود:', statusCode, 'إعادة الاتصال:', shouldReconnect);

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

      // تجاهل الجروبات
      if (isGroup) continue;

      // التعامل مع الصور
      const imageMsg = msg.message?.imageMessage;
      const textMsg = msg.message?.conversation || 
                      msg.message?.extendedTextMessage?.text || '';

      // أوامر نصية
      if (textMsg && !imageMsg) {
        const cmd = textMsg.trim().toLowerCase();

        if (cmd === 'مساعدة' || cmd === 'المساعدة' || cmd === 'help') {
          await sock.sendMessage(jid, { text: HELP_MSG });
          continue;
        }

        if (cmd === 'حالتي' || cmd === 'حالة') {
          if (isSubscribed(jid)) {
            const subs = loadSubscriptions();
            const sub = subs[jid];
            const expiry = new Date(sub.expiry).toLocaleDateString('ar-EG');
            await sock.sendMessage(jid, { text: `✅ انت مشترك!\n📅 ينتهي الاشتراك في: ${expiry}` });
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

        // تحية
        if (cmd.includes('مرحبا') || cmd.includes('هاي') || cmd.includes('اهلا') || cmd.includes('السلام')) {
          await sock.sendMessage(jid, { text: WELCOME_MSG });
          continue;
        }

        // أي رسالة تانية
        if (!imageMsg) {
          await sock.sendMessage(jid, { text: WELCOME_MSG });
          continue;
        }
      }

      // التعامل مع صورة الإيصال
      if (imageMsg) {
        try {
          await sock.sendMessage(jid, { text: '🔍 جاري التحقق من الإيصال...' });

          // تحميل الصورة
          const stream = await sock.downloadMediaMessage(msg, 'buffer');
          
          if (!stream || stream.length === 0) {
            await sock.sendMessage(jid, { text: '❌ مش قادر أحمل الصورة. حاول تاني.' });
            continue;
          }

          const mimeType = imageMsg.mimetype || 'image/jpeg';

          // تحليل الإيصال بالذكاء الاصطناعي
          const analysis = await analyzeReceipt(stream, mimeType);

          if (!analysis) {
            await sock.sendMessage(jid, { text: '❌ حصل خطأ في تحليل الإيصال. حاول تاني.' });
            continue;
          }

          // التحقق البرمجي
          const verification = verifyReceipt(analysis);

          console.log(`\n📋 Verification for ${sender}:`);
          verification.results.forEach(r => console.log('  ', r));
          console.log('  النتيجة:', verification.passed ? '✅ مقبول' : '❌ مرفوض');
          console.log('');

          if (verification.passed) {
            // تفعيل الاشتراك
            const expiry = activateSubscription(jid);
            const expiryStr = expiry.toLocaleDateString('ar-EG');
            
            await sock.sendMessage(jid, { 
              text: `✅ تم التحقق من الإيصال بنجاح!\n\n🎫 تم تفعيل اشتراكك في OptiSize Premium\n📅 ينتهي في: ${expiryStr}\n\nشكراً ليك! 🎉` 
            });

            // إبلاغ المالك
            const ownerJid = OWNER_NUMBER + '@s.whatsapp.net';
            try {
              await sock.sendMessage(ownerJid, { 
                text: `📥 اشتراك جديد!\n👤 الرقم: ${sender}\n💰 المبلغ: ${SUBSCRIPTION_PRICE} جنيه\n📱 التطبيق: ${analysis.APP_NAME}\n📅 ينتهي: ${expiryStr}` 
              });
            } catch (e) {}

          } else {
            // رفض الإيصال
            const reasons = verification.results.filter(r => r.startsWith('❌')).join('\n');
            
            await sock.sendMessage(jid, { 
              text: `❌ الإيصال مرفوض!\n\n${reasons}\n\nتأكد إنك:\n- بعت إيصال حقيقي من تطبيق دفع معروف\n- المبلغ 50 جنيه\n- التحويل على الرقم ${PAYMENT_NUMBER}\n- الإيصال من اليوم أو أمس\n\nلو مش راضي يقبل، تواصل مع الدعم.` 
            });
          }

        } catch (error) {
          console.error('Error processing receipt:', error);
          await sock.sendMessage(jid, { text: '❌ حصل خطأ. حول تاني.' });
        }
      }
    }
  });

  return sock;
}

// ============ تشغيل البوت ============
console.log('🤖 OptiSize WhatsApp Bot - Starting...');
console.log(`💰 Subscription: ${SUBSCRIPTION_PRICE} EGP/month`);
console.log(`📱 Payment Number: ${PAYMENT_NUMBER}`);
console.log(`👑 Owner: ${OWNER_NUMBER}`);
console.log('-----------------------------------');

startBot().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
