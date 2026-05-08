// ====== OptiSize WhatsApp Bot - Dual AI Verification ======
// Uses Groq API with two-step verification to detect fake receipts
// Step 1: Detailed visual analysis (forces AI to list specific UI elements)
// Step 2: Authenticity verification (checks if visual elements match real apps)

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  getContentType,
  isLidUser,
  isJidGroup,
} from '@whiskeysockets/baileys';

import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import qrcode from 'qrcode';

// ====== Groq AI Setup ======
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ====== Paths ======
const AUTH_PATH = path.join(process.cwd(), 'auth_info');
const CODES_FILE = path.join(process.cwd(), 'subscription_codes.json');
const LOG_FILE = path.join(process.cwd(), 'bot.log');

// ====== State ======
let userStates = {};
let botConnected = false;
let sock = null;
let presenceInterval = null;
let reconnectAttempts = 0;
const MAX_RECONNECT = 10;

// ====== LID Mapping ======
const lidMap = {};
function loadLidMappings() {
  try {
    const files = fs.readdirSync(AUTH_PATH).filter(f => f.startsWith('lid-mapping-') && f.endsWith('_reverse.json'));
    for (const f of files) {
      try {
        const lid = f.replace('lid-mapping-', '').replace('_reverse.json', '');
        const phone = JSON.parse(fs.readFileSync(path.join(AUTH_PATH, f), 'utf-8'));
        if (phone && typeof phone === 'string') lidMap[lid] = phone;
      } catch {}
    }
    log('Loaded ' + Object.keys(lidMap).length + ' LID mappings');
  } catch (e) { log('LID mappings: ' + e.message); }
}

function resolveLidToPhone(lid) {
  const lidNum = lid.replace('@lid', '');
  if (lidMap[lidNum]) return lidMap[lidNum];
  try {
    const f = path.join(AUTH_PATH, `lid-mapping-${lidNum}_reverse.json`);
    if (fs.existsSync(f)) {
      const phone = JSON.parse(fs.readFileSync(f, 'utf-8'));
      if (phone && typeof phone === 'string') { lidMap[lidNum] = phone; return phone; }
    }
  } catch {}
  return null;
}

// ====== Deduplication ======
const processedMsgIds = new Set();
function isDuplicate(msgId) {
  if (processedMsgIds.has(msgId)) return true;
  processedMsgIds.add(msgId);
  if (processedMsgIds.size > 500) {
    const arr = [...processedMsgIds];
    arr.splice(0, 200).forEach(id => processedMsgIds.delete(id));
  }
  return false;
}

// ====== Rate Limiting ======
const messageTimestamps = {};
let totalMessagesSent = [];
const lastResponseTime = {};

function isRateLimited(phone) {
  const now = Date.now();
  const ago = now - 3600000;
  totalMessagesSent = totalMessagesSent.filter(t => t > ago);
  if (totalMessagesSent.length >= 40) return true;
  if (!messageTimestamps[phone]) messageTimestamps[phone] = [];
  messageTimestamps[phone] = messageTimestamps[phone].filter(t => t > ago);
  if (messageTimestamps[phone].length >= 15) return true;
  return false;
}

function canRespond(phone) {
  const now = Date.now();
  if (lastResponseTime[phone] && (now - lastResponseTime[phone]) < 3000) return false;
  return true;
}

// ====== Logging ======
function log(msg) {
  const ts = new Date().toISOString();
  const line = '[' + ts + '] ' + msg;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch {}
}

// ====== File Helpers ======
function loadCodes() {
  try { if (fs.existsSync(CODES_FILE)) return JSON.parse(fs.readFileSync(CODES_FILE, 'utf-8')); } catch {}
  return {};
}

function saveCodes(codes) {
  try { fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2)); } catch {}
}

function generateCode(phone) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const last4 = phone.replace(/\D/g, '').slice(-4);
  let code;
  const codes = loadCodes();
  do {
    code = '' + letters[Math.floor(Math.random()*26)] + letters[Math.floor(Math.random()*26)] + letters[Math.floor(Math.random()*26)] + last4 + Math.floor(Math.random()*10);
  } while (codes[code]);
  return code;
}

// ====== Message Templates ======
const WELCOME = 'مرحباً بك في OptiSize! 👁️\n\nكيف يمكنني مساعدتك؟\n\n1️⃣ اشتراك - اشترك في مركز صحة العين VIP\n2️⃣ تحدث - تحدث مع فريق الدعم\n\nأرسل الرقم أو الكلمة 👇';

const SUB_INFO = '💎 اشتراك مركز صحة العين VIP\n\nقيمة الاشتراك: 50 جنيه شهرياً\n\n💰 طريقة الدفع:\nحول 50 جنيه على رقم:\n📱 01028900122\n\n(فودافون كاش / إنستاباي / أي طريقة تحويل)\n\nبعد الدفع أرسل صورة تأكيد الدفع هنا ✅\n\n📸 تأكد أن الصورة توضح:\n- الرقم المحول ليه (01028900122)\n- المبلغ (50 جنيه)\n- تاريخ ووقت التحويل';

const REJECT_TEMPLATE = '❌ الإيصال غير مقبول.\nالسبب: {reason}\n\nتأكد إن الإيصال بيوضح:\n- كلمة تدل على الدفع (تم التحويل/تم الدفع)\n- الرقم: 01028900122\n- المبلغ: 50 جنيه بالظبط\n- تاريخ ووقت التحويل (اليوم أو أمس)\n\nأي طريقة دفع مقبولة (فودافون كاش / إنستاباي / تحويل بنكي)\n\nأرسل صورة الإيصال الصحيحة تاني ✅';

// ====== Safe Send ======
async function safeSend(jid, content) {
  if (!sock || !botConnected) return false;
  const phone = jid.replace('@s.whatsapp.net', '').replace('@lid', '');
  if (isRateLimited(phone)) return false;
  try {
    await sock.sendMessage(jid, content);
    totalMessagesSent.push(Date.now());
    if (!messageTimestamps[phone]) messageTimestamps[phone] = [];
    messageTimestamps[phone].push(Date.now());
    log('Sent to ' + phone);
    return true;
  } catch (e) {
    log('Send error: ' + e.message);
    return false;
  }
}

// ====== Groq AI Functions ======

// Step 1: Detailed Visual Analysis - forces AI to describe EVERYTHING it sees
const STEP1_PROMPT = `أنت خبير في تحليل صور إيصالات الدفع المصرية. حلل الصورة دي بالتفصيل الممل.

المطلوب بالظبط:
1. APP_NAME: اسم التطبيق أو البنك اللي الإيصال منه (فودافون كاش / إنستاباي / بنك مصر / النهبي / غيرها) - لو مش عارف اكتب "مش واضح"
2. HAS_LOGO: هل فيه شعار رسمي للتطبيق أو البنك؟ (نعم/لا) - الشعار لازم يكون واضح ومحدد مش مجرد نص
3. LOGO_DETAILS: لو فيه شعار، اكتب وصفه بالتفصيل (لونه، شكله، مكانه في الصورة)
4. UI_ELEMENTS: اكتب كل العناصر المرئية في الإيصال (خلفية، ألوان، حدود، أيقونات، أزرار) - بالتفصيل
5. ALL_TEXT: اكتب كل النصوص المكتوبة في الإيصال بالظبط - كل حاجة
6. SENDER_INFO: هل فيه معلومات عن المرسل؟ (اسم أو رقم) اكتبها
7. RECEIVER_INFO: هل فيه معلومات عن المستقبل؟ اكتبها
8. AMOUNT_TEXT: المبلغ المكتوب بالظبط
9. DATE_TEXT: التاريخ المكتوب بالظبط
10. TIME_TEXT: الوقت المكتوب بالظبط
11. KEYWORDS: كلمات تدل على التحويل (تم التحويل / تم الإرسال / تحويل ناجح / Sent / Paid / غيرها)
12. LAYOUT_QUALITY: وصف شكل الإيصال (هل شكله احترافي زي التطبيقات الحقيقية ولا شكله بسيط ومصنوع؟)

⚠️ مهم جداً: اكتب كل حاجة بتشوفها بالتفصيل - مش اختصارات`;

// Step 2: Authenticity Check - uses the visual analysis to determine if real or fake
const STEP2_PROMPT = `أنت نظام أمني متخصص في كشف الإيصالات الوهمية والمزورة. عندك تحليل بصري لإيصال دفع، وحتحدد هل هو حقيقي ولا وهمي.

🚨 تحذير: فيه ناس بتعمل إيصالات وهمية باستخدام مواقع عمل إيصالات (receipt-generator, fake-receipt-maker) وبتبعتها على أنها حقيقية. لازم تكتشف ده!

قواعد الكشف عن الوهمي:
1. الإيصال الحقيقي لازم يكون من تطبيق دفع حقيقي (فودافون كاش، إنستاباي، بنك مصر، النهبي، الخ)
2. الإيصال الحقيقي لازم فيه شعار رسمي واضح للتطبيق - مجرد اسم التطبيق مكتوب مش كفاية
3. الإيصال الحقيقي فيه تصميم UI احترافي (ألوان التطبيق، أيقونات، تخطيط محدد)
4. الإيصال الحقيقي فيه تفاصيل المرسل (اسم أو رقم)
5. الإيصال الوهمي علاماته:
   - مفيش شعار رسمي واضح أو الشعار مش مطابق للتطبيق
   - تصميم بسيط جداً أو شكله زي قالب جاهز
   - مفيش تفاصيل المرسل
   - ألوان أو خطوط مش مطابقة للتطبيق الحقيقي
   - شكله زي screenshot من موقع عمل إيصالات
   - مفيش عناصر UI خاصة بالتطبيق (أزرار، أيقونات، navigation bar)

بناءً على التحليل البصري ده، حدد:

IS_REAL: [نعم/لا]
APP_CONFIRMED: [اسم التطبيق المؤكد أو "غير مؤكد"]
AUTHENTICITY_SCORE: [من 1 لـ 10 - 10 يعني حقيقي 100%]
PROOF_OF_REALITY: [لو حقيقي: إيه الأدلة البصرية اللي بتأكد إنه من التطبيق الحقيقي]
FAKE_INDICATORS: [لو وهمي: إيه العلامات اللي بتخليك تقول وهمي. لو حقيقي: "لا يوجد"]
RECEIVER_NUMBER: [الرقم المحول ليه]
AMOUNT: [المبلغ]
PAYMENT_DATE: [التاريخ]
PAYMENT_TIME: [الوقت]
PAYMENT_KEYWORD: [كلمة الدفع]
PAYMENT_METHOD: [طريقة الدفع]
RESULT: [مقبول/مرفوض]
REJECT_REASON: [سبب الرفض لو مرفوض، أو "لا يوجد" لو مقبول]

⚠️ لو AUTHENTICITY_SCORE أقل من 7 → RESULT لازم يكون مرفوض
⚠️ لو APP_CONFIRMED = "غير مؤكد" → RESULT لازم يكون مرفوض
⚠️ لو مفيش شعار رسمي → RESULT لازم يكون مرفوض`;

async function callGroqVision(prompt, base64Image) {
  const imageData = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;
  
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
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageData } }
        ]
      }],
      temperature: 0.1,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function extractField(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
}

function verifyReceiptData(step1Response, step2Response) {
  // Extract fields from Step 2 (authenticity check)
  const isReal = extractField(step2Response, /IS_REAL:\s*(نعم|لا)/);
  const appConfirmed = extractField(step2Response, /APP_CONFIRMED:\s*(.+)/);
  const authScore = extractField(step2Response, /AUTHENTICITY_SCORE:\s*(\d+)/);
  const proofOfReality = extractField(step2Response, /PROOF_OF_REALITY:\s*(.+)/);
  const fakeIndicators = extractField(step2Response, /FAKE_INDICATORS:\s*(.+)/);
  const receiverNumber = extractField(step2Response, /RECEIVER_NUMBER:\s*(.+)/);
  const amount = extractField(step2Response, /AMOUNT:\s*(.+)/);
  const paymentDate = extractField(step2Response, /PAYMENT_DATE:\s*(.+)/);
  const paymentTime = extractField(step2Response, /PAYMENT_TIME:\s*(.+)/);
  const paymentKeyword = extractField(step2Response, /PAYMENT_KEYWORD:\s*(.+)/);
  const paymentMethod = extractField(step2Response, /PAYMENT_METHOD:\s*(.+)/);
  const aiResult = extractField(step2Response, /RESULT:\s*(مقبول|مرفوض)/);
  const rejectReason = extractField(step2Response, /REJECT_REASON:\s*(.+)/);

  // Also extract from Step 1 for cross-verification
  const hasLogo = extractField(step1Response, /HAS_LOGO:\s*(نعم|لا)/);
  const appFromStep1 = extractField(step1Response, /APP_NAME:\s*(.+)/);
  const keywordsFromStep1 = extractField(step1Response, /KEYWORDS:\s*(.+)/);

  log('Step2 fields: isReal=' + isReal + ' app=' + appConfirmed + ' score=' + authScore + ' result=' + aiResult);
  log('Step1 fields: hasLogo=' + hasLogo + ' app=' + appFromStep1);

  // ====== PROGRAMMATIC VERIFICATION ======
  
  // 1. AI says it's real?
  const aiSaysReal = isReal === 'نعم';
  
  // 2. Authenticity score >= 7?
  const score = parseInt(authScore) || 0;
  const scoreOk = score >= 7;
  
  // 3. App is confirmed (not "مش واضح" or "غير مؤكد")?
  const appOk = appConfirmed !== 'غير مؤكد' && appConfirmed !== 'مش واضح' && appConfirmed !== '' && appConfirmed !== 'لا يوجد';
  
  // 4. Has logo?
  const logoOk = hasLogo === 'نعم';
  
  // 5. Has payment keyword?
  const keywordOk = paymentKeyword !== 'لا يوجد' && paymentKeyword !== '' && paymentKeyword !== 'لايوجد' &&
                    keywordsFromStep1 !== 'لا يوجد' && keywordsFromStep1 !== '' && keywordsFromStep1 !== 'لايوجد';
  
  // 6. Receiver number matches?
  const REQUIRED_NUMBER = '01028900122';
  const numberOk = receiverNumber.includes(REQUIRED_NUMBER) || receiverNumber.replace(/\s/g, '').includes(REQUIRED_NUMBER);
  
  // 7. Amount is exactly 50?
  const amountClean = amount.replace(/\s/g, '');
  const amountHas50 = amountClean.includes('50');
  const amountHas500 = amountClean.includes('500');
  const amountHas5Only = /(^|[^\d])5($|[^\d])/.test(amountClean) && !amountHas50;
  const amountOk = amountHas50 && !amountHas500 && !amountHas5Only;
  
  // 8. Date is today or yesterday?
  const now = new Date();
  const todayDay = now.getDate();
  const todayMonth = now.getMonth() + 1;
  const todayYear = now.getFullYear();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yestDay = yesterday.getDate();
  const yestMonth = yesterday.getMonth() + 1;
  const yestYear = yesterday.getFullYear();
  
  const dateClean = paymentDate.replace(/\s/g, '');
  
  const arabicMonths = {
    'يناير': 1, 'فبراير': 2, 'مارس': 3, 'أبريل': 4, 'إبريل': 4, 'مايو': 5, 'يونيو': 6,
    'يوليو': 7, 'أغسطس': 8, 'سبتمبر': 9, 'أكتوبر': 10, 'نوفمبر': 11, 'ديسمبر': 12
  };
  
  function checkDateMatch(day, month, year) {
    if (day === todayDay && month === todayMonth && (year === todayYear || year === undefined)) return true;
    if (day === yestDay && month === yestMonth && (year === yestYear || year === undefined)) return true;
    return false;
  }
  
  let dateOk = false;
  const slashMatch = dateClean.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (slashMatch) {
    const d = parseInt(slashMatch[1]);
    const m = parseInt(slashMatch[2]);
    let y = parseInt(slashMatch[3]);
    if (y < 100) y += 2000;
    dateOk = checkDateMatch(d, m, y);
  }
  if (!dateOk) {
    const isoMatch = dateClean.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (isoMatch) {
      dateOk = checkDateMatch(parseInt(isoMatch[3]), parseInt(isoMatch[2]), parseInt(isoMatch[1]));
    }
  }
  if (!dateOk) {
    for (const [monthName, monthNum] of Object.entries(arabicMonths)) {
      if (paymentDate.includes(monthName)) {
        const dayMatch = paymentDate.match(/(\d{1,2})/);
        const yearMatch = paymentDate.match(/(\d{4})/);
        if (dayMatch) {
          dateOk = checkDateMatch(parseInt(dayMatch[1]), monthNum, yearMatch ? parseInt(yearMatch[1]) : undefined);
        }
        if (dateOk) break;
      }
    }
  }
  
  // 9. Time is present and valid?
  const timeClean = paymentTime.replace(/\s/g, '');
  const timeOk = timeClean !== '' &&
    paymentTime !== 'لا يوجد' && paymentTime !== 'لايوجد' &&
    /\d{1,2}[:.]\d{2}/.test(timeClean) &&
    parseInt(timeClean.match(/\d{1,2}/)?.[0] || '99') < 24;
  
  // 10. No fake indicators?
  const noFakeIndicators = fakeIndicators === 'لا يوجد' || fakeIndicators === '' || fakeIndicators === 'لايوجد';
  
  // ====== FINAL DECISION ======
  // ALL of these must be true for acceptance:
  const allOk = aiSaysReal && scoreOk && appOk && logoOk && keywordOk && 
                numberOk && amountOk && dateOk && timeOk && noFakeIndicators && 
                aiResult === 'مقبول';
  
  // Build specific rejection reason
  let reason = '';
  if (!aiSaysReal) reason = '🚨 الإيصال وهمي أو مش حقيقي! ' + (fakeIndicators !== 'لا يوجد' ? fakeIndicators : 'تم اكتشاف علامات تزوير');
  else if (!scoreOk) reason = '🚨 درجة موثوقية الإيصال ضعيفة (' + authScore + '/10) - ممكن يكون وهمي';
  else if (!appOk) reason = '🚨 مفيش تطبيق دفع مؤكد - الإيصال مش من تطبيق حقيقي معروف';
  else if (!logoOk) reason = '🚨 مفيش شعار رسمي للتطبيق - الإيصال ممكن يكون وهمي';
  else if (!noFakeIndicators) reason = '🚨 فيه علامات تزوير: ' + fakeIndicators;
  else if (!keywordOk) reason = 'مفيش كلمة تدل على إن فيه دفع أو تحويل حصل';
  else if (!numberOk && !amountOk) reason = 'الرقم والمبلغ مختلفين عن المطلوب (01028900122 - 50 جنيه)';
  else if (!numberOk) reason = 'الرقم المحول ليه مختلف عن 01028900122 (الرقم في الإيصال: ' + receiverNumber + ')';
  else if (!amountOk) reason = 'المبلغ مختلف عن 50 جنيه (المبلغ في الإيصال: ' + amount + ')';
  else if (!dateOk) reason = 'التاريخ مش تاريخ اليوم أو أمس (التاريخ في الإيصال: ' + paymentDate + ')';
  else if (!timeOk) reason = 'مفيش وقت واضح للتحويل في الإيصال';
  else if (aiResult !== 'مقبول') reason = rejectReason || 'الإيصال غير مقبول';
  
  return {
    verified: allOk,
    reason,
    details: {
      isReal, appConfirmed, authScore, proofOfReality, fakeIndicators,
      receiverNumber, amount, paymentDate, paymentTime, paymentKeyword,
      paymentMethod, aiResult, hasLogo, appFromStep1,
      checks: { aiSaysReal, scoreOk, appOk, logoOk, keywordOk, numberOk, amountOk, dateOk, timeOk, noFakeIndicators }
    }
  };
}

async function handleReceipt(from, phone, msg) {
  await safeSend(from, { text: '⏳ جاري مراجعة إيصال الدفع...' });
  
  try {
    // Download the image
    const buf = await downloadMediaMessage(msg, 'buffer', {}, { logger: undefined, reuploadRequest: undefined });
    log('Receipt image downloaded, size: ' + (buf.length / 1024).toFixed(1) + 'KB');
    
    const base64Image = buf.toString('base64');
    
    // ====== STEP 1: Detailed Visual Analysis ======
    log('Step 1: Sending receipt for visual analysis...');
    const step1Response = await callGroqVision(STEP1_PROMPT, base64Image);
    log('Step 1 response: ' + step1Response.substring(0, 300));
    
    // ====== STEP 2: Authenticity Verification ======
    log('Step 2: Verifying authenticity...');
    const step2Prompt = STEP2_PROMPT + '\n\n--- التحليل البصري ---\n' + step1Response;
    const step2Response = await callGroqVision(step2Prompt, base64Image);
    log('Step 2 response: ' + step2Response.substring(0, 300));
    
    // ====== PROGRAMMATIC VERIFICATION ======
    const result = verifyReceiptData(step1Response, step2Response);
    log('Verification: verified=' + result.verified + ' reason=' + result.reason);
    
    if (result.verified) {
      const code = generateCode(phone);
      const codes = loadCodes();
      codes[code] = { phone, createdAt: new Date().toISOString(), activated: false };
      saveCodes(codes);
      userStates[phone] = 'idle';
      await safeSend(from, { text: '✅ تم تأكيد الدفع!\n\n🔑 كود الاشتراك: ' + code + '\n\nادخل الكود في OptiSize في مركز صحة العين\n⏰ صالح لمدة شهر\nشكراً لاشتراكك! 🙏' });
      log('Receipt ACCEPTED for ' + phone + ', code: ' + code);
    } else {
      userStates[phone] = 'awaiting_receipt';
      await safeSend(from, { text: REJECT_TEMPLATE.replace('{reason}', result.reason) });
      log('Receipt REJECTED for ' + phone + ': ' + result.reason);
    }
    
  } catch (aiErr) {
    log('AI verify failed: ' + aiErr.message);
    userStates[phone] = 'awaiting_receipt';
    
    let reason = 'خدمة التحقق مش متاحة حالياً، حاول تاني بعد شوية';
    if (aiErr.message.includes('timeout')) reason = 'السيرفر بطيء حالياً، حاول تبعت الصورة تاني';
    else if (aiErr.message.includes('decommissioned')) reason = 'الموديل متوقف حالياً، جرب تاني بعد شوية';
    else if (aiErr.message.includes('429')) reason = 'خدمة التحقق وصلت للحد المسموح، حاول تاني بعد دقيقة';
    
    await safeSend(from, { text: REJECT_TEMPLATE.replace('{reason}', reason) });
  }
}

// ====== QR Code Storage ======
let currentQRCode = null;

// ====== HTTP Server ======
http.createServer(async (req, res) => {
  if (req.url === '/' || req.url === '/qr') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    if (botConnected) {
      res.end('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;background:#1a1a2e;color:#eee"><div style="text-align:center"><h1>✅ Bot Connected!</h1><p>The bot is running and connected to WhatsApp.</p></div></body></html>');
    } else if (currentQRCode) {
      res.end('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;background:#1a1a2e;color:#eee"><div style="text-align:center"><h2>📱 Scan QR Code with WhatsApp</h2><p>WhatsApp > Settings > Linked Devices > Link a device</p><img src="' + currentQRCode + '" style="border:10px solid white;border-radius:10px;margin:20px"/><p style="color:#aaa">QR refreshes automatically every 20 seconds</p></div></body></html>');
    } else {
      res.end('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;background:#1a1a2e;color:#eee"><div style="text-align:center"><h2>⏳ Waiting for QR Code...</h2><p>The bot is starting up. Refresh in a few seconds.</p></div></body></html>');
    }
    return;
  }
  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ connected: botConnected, uptime: process.uptime(), pid: process.pid }));
    return;
  }
  if (req.url === '/log') {
    try {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end((fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf-8') : '').slice(-5000));
    } catch { res.end('No logs'); }
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({ status: 'ok', connected: botConnected }));
}).listen(process.env.PORT || 8787, '0.0.0.0', () => {
  log('API on :' + (process.env.PORT || 8787));
  startWA();
});

// ====== WhatsApp Connection ======
async function startWA() {
  log('Starting WhatsApp connection...');
  try {
    const { version } = await fetchLatestBaileysVersion();
    log('Baileys version: ' + version.join('.'));
    
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH);
    
    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: true,
      browser: ['OptiSize Bot', 'Chrome', '1.0'],
      markOnlineOnConnect: true,
      connectTimeoutMs: 30000,
      keepAliveIntervalMs: 30000,
      generateHighQualityLinkPreview: false,
      emitOwnEvents: false,
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    // ====== CONNECTION UPDATES ======
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        botConnected = false;
        currentQRCode = null;
        
        try {
          currentQRCode = await qrcode.toDataURL(qr, { width: 400, margin: 2 });
        } catch (e) { log('QR error: ' + e.message); }
        
        // Generate QR image URL using free API
        const qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=' + encodeURIComponent(qr);
        
        console.log('\n' + '='.repeat(50));
        console.log('📱 افتح الرابط ده في المتصفح عشان تشوف QR Code:');
        console.log(qrImageUrl);
        console.log('='.repeat(50));
        console.log('أو افتح الرابط ده عشان تشوف صفحة البوت:');
        console.log('http://localhost:' + (process.env.PORT || 8787));
        console.log('='.repeat(50) + '\n');
      }
      
      if (connection === 'close') {
        botConnected = false;
        if (presenceInterval) { clearInterval(presenceInterval); presenceInterval = null; }
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        log('Connection closed. Status: ' + statusCode);
        
        if (statusCode !== DisconnectReason.loggedOut && reconnectAttempts < MAX_RECONNECT) {
          reconnectAttempts++;
          const delay = Math.min(5000 * reconnectAttempts, 60000);
          log('Reconnecting in ' + (delay/1000) + 's...');
          setTimeout(startWA, delay);
        } else if (statusCode === DisconnectReason.loggedOut) {
          log('Logged out. Need to re-pair.');
          reconnectAttempts = 0;
        }
      }
      
      if (connection === 'open') {
        botConnected = true;
        currentQRCode = null;
        reconnectAttempts = 0;
        log('WHATSAPP CONNECTED!');
        // Set online
        try { await sock.sendPresenceUpdate('available'); } catch {}
        if (presenceInterval) clearInterval(presenceInterval);
        presenceInterval = setInterval(async () => {
          try { await sock.sendPresenceUpdate('available'); } catch {}
        }, 120000);
      }
    });
    
    // ====== MESSAGE HANDLER ======
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        const m = messages[0];
        if (!m || !m.message || m.key.fromMe) return;
        
        const from = m.key.remoteJid;
        const msgId = m.key.id;
        
        if (isDuplicate(msgId)) return;
        if (type !== 'notify' && type !== 'append') return;
        if (from.endsWith('@g.us') || from.endsWith('@newsletter')) return;
        
        let phone = '';
        let respondTo = from;
        
        if (from.endsWith('@s.whatsapp.net')) {
          phone = from.replace('@s.whatsapp.net', '');
        } else if (from.endsWith('@lid')) {
          const resolvedPhone = resolveLidToPhone(from);
          if (resolvedPhone) {
            phone = resolvedPhone;
            respondTo = resolvedPhone + '@s.whatsapp.net';
          } else {
            phone = from.replace('@lid', '');
            respondTo = from;
          }
        } else return;
        
        if (!canRespond(phone)) return;
        
        const text = m.message?.conversation 
          || m.message?.extendedTextMessage?.text 
          || m.message?.imageMessage?.caption 
          || '';
        
        log('DM from ' + phone + ': ' + (text || '[IMAGE]'));
        
        await new Promise(r => setTimeout(r, 800));
        try { await sock.readMessages([m.key]); } catch {}
        
        try { await sock.sendPresenceUpdate('composing', respondTo); } catch {}
        await new Promise(r => setTimeout(r, 1500));
        
        lastResponseTime[phone] = Date.now();
        
        // ====== Image (payment receipt) ======
        if (m.message?.imageMessage) {
          if (userStates[phone] === 'awaiting_receipt') {
            await handleReceipt(respondTo, phone, m);
          } else {
            await safeSend(respondTo, { text: WELCOME });
          }
          try { await sock.sendPresenceUpdate('available'); } catch {}
          return;
        }
        
        // ====== Text commands ======
        const cmd = text.trim();
        if (cmd === '1' || cmd === 'اشتراك' || cmd === 'اشترك') {
          userStates[phone] = 'awaiting_receipt';
          await safeSend(respondTo, { text: SUB_INFO });
        } else if (cmd === '2' || cmd === 'تحدث') {
          await safeSend(respondTo, { text: '👤 تم تحويلك لفريق الدعم.\nلإنهاء المحادثة أرسل: انتهى' });
        } else {
          await safeSend(respondTo, { text: WELCOME });
        }
        
        try { await sock.sendPresenceUpdate('available'); } catch {}
        
      } catch (err) {
        log('Handler error: ' + err.message);
      }
    });
    
  } catch (err) {
    log('startWA error: ' + err.message);
    botConnected = false;
    if (reconnectAttempts < MAX_RECONNECT) {
      reconnectAttempts++;
      setTimeout(startWA, Math.min(5000 * reconnectAttempts, 60000));
    }
  }
}

// ====== Process Handlers ======
process.on('uncaughtException', (err) => log('Uncaught: ' + err.message));
process.on('unhandledRejection', (reason) => log('Rejection: ' + (reason instanceof Error ? reason.message : String(reason))));

// ====== STARTUP ======
log('OptiSize Bot starting (Dual AI Verification)...');
log('Node: ' + process.version + ' PID: ' + process.pid);
log('Groq API Key: ' + (GROQ_API_KEY ? 'SET' : 'NOT SET'));
loadLidMappings();
