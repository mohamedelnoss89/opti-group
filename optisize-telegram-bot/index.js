// ====== OptiSize Telegram Bot v1.0 ======
// - Telegram Bot API via node-telegram-bot-api
// - Gemini AI for receipt verification
// - Code generation (8 chars) on receipt acceptance
// - Webhook support for 24/7 uptime
// - All subscription codes built-in
// - Chat mode + Admin commands

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');

// ====== Gemini AI Setup ======
const { GoogleGenerativeAI } = require('@google/generative-ai');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
let genAI = null;
let geminiModel = null;

function initGemini() {
  if (!GEMINI_API_KEY) {
    log('WARNING: GEMINI_API_KEY not set! Receipt verification will not work.');
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    log('AI: Gemini API initialized successfully');
    return true;
  } catch (e) {
    log('AI: Gemini init failed: ' + e.message);
    return false;
  }
}

// ====== Paths ======
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const CODES_FILE = path.join(DATA_DIR, 'subscription_codes.json');
const GENERATED_CODES_FILE = path.join(DATA_DIR, 'generated_codes.json');
const RECEIPT_HASHES_FILE = path.join(DATA_DIR, 'receipt_hashes.json');
const LOG_FILE = path.join(DATA_DIR, 'bot.log');

// ====== Subscription Codes (Built-in) ======
const MASTER_CODES = {
  'SIZE2026': { type: 'master', days: 3650, maxUsers: 3, usedBy: [] },
  'OPTI2026': { type: 'master', days: 3650, maxUsers: 3, usedBy: [] },
  'EYES2026': { type: 'master', days: 3650, maxUsers: 3, usedBy: [] }
};

const NORMAL_CODES = {
  'OPTA7X9K': { type: 'normal', days: 30, maxUsers: 1, usedBy: [] },
  'OPTB3M5N': { type: 'normal', days: 30, maxUsers: 1, usedBy: [] },
  'OPTC4P6R': { type: 'normal', days: 30, maxUsers: 1, usedBy: [] },
  'OPTD2T8W': { type: 'normal', days: 30, maxUsers: 1, usedBy: [] },
  'OPTE6V1Y': { type: 'normal', days: 30, maxUsers: 1, usedBy: [] },
  'OPTF9H3J': { type: 'normal', days: 30, maxUsers: 1, usedBy: [] }
};

const GIFT_CODES = {
  'GIFTA1B2': { type: 'gift', days: 30, maxUsers: 1, usedBy: [] },
  'GIFTD4E5': { type: 'gift', days: 30, maxUsers: 1, usedBy: [] },
  'GIFTG7H8': { type: 'gift', days: 30, maxUsers: 1, usedBy: [] },
  'GIFTJ0K1': { type: 'gift', days: 30, maxUsers: 1, usedBy: [] },
  'GIFTM3N4': { type: 'gift', days: 30, maxUsers: 1, usedBy: [] }
};

const ALL_CODES = { ...MASTER_CODES, ...NORMAL_CODES, ...GIFT_CODES };

// ====== State ======
let userStates = {}; // userId -> state
let adminChatActive = {}; // userId -> boolean
let adminIds = (process.env.ADMIN_IDS || '').split(',').filter(Boolean);

// ====== Logging ======
function log(msg) {
  const ts = new Date().toISOString();
  const line = '[' + ts + '] ' + msg;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch {}
}

// ====== Generated Codes Storage ======
function loadGeneratedCodes() {
  try {
    if (fs.existsSync(GENERATED_CODES_FILE)) {
      return JSON.parse(fs.readFileSync(GENERATED_CODES_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

function saveGeneratedCodes(codes) {
  try { fs.writeFileSync(GENERATED_CODES_FILE, JSON.stringify(codes, null, 2)); } catch {}
}

function loadReceiptHashes() {
  try {
    if (fs.existsSync(RECEIPT_HASHES_FILE)) {
      return JSON.parse(fs.readFileSync(RECEIPT_HASHES_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

function saveReceiptHashes(hashes) {
  try { fs.writeFileSync(RECEIPT_HASHES_FILE, JSON.stringify(hashes, null, 2)); } catch {}
}

// ====== App URL (for saving codes to app database) ======
const APP_URL = process.env.APP_URL || '';
const APP_SECRET = process.env.APP_SECRET || 'optisize-bot-2026';

// ====== Save code to app database ======
async function saveCodeToApp(code, userId) {
  if (!APP_URL) {
    log('APP_URL not set - code saved locally only: ' + code);
    return false;
  }
  try {
    const url = APP_URL.replace(/\/$/, '') + '/api/subscriptions/create';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + APP_SECRET
      },
      body: JSON.stringify({ userId, code })
    });
    const data = await res.json();
    if (data.success) {
      log('Code saved to app DB: ' + code);
      return true;
    } else {
      log('App DB save failed: ' + (data.error || 'unknown'));
      return false;
    }
  } catch (e) {
    log('App DB save error: ' + e.message);
    return false;
  }
}

// ====== Code Generation (8 chars exactly) ======
function generateActivationCode(userId) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const userIdStr = String(userId).slice(-4);
  const codes = loadGeneratedCodes();
  let code;
  let attempts = 0;
  do {
    const randChar = letters[Math.floor(Math.random() * 26)];
    code = 'OPT' + userIdStr + randChar;
    attempts++;
    if (attempts > 50) {
      code = 'OPT' + digits[Math.floor(Math.random()*10)] + digits[Math.floor(Math.random()*10)] + letters[Math.floor(Math.random()*26)] + digits[Math.floor(Math.random()*10)] + letters[Math.floor(Math.random()*26)];
    }
  } while (codes[code] && attempts < 100);

  codes[code] = {
    userId: userId,
    createdAt: new Date().toISOString(),
    used: false,
    type: 'receipt',
    days: 30
  };
  saveGeneratedCodes(codes);
  return code;
}

// ====== Code Verification (for app API) ======
function verifyCode(code) {
  const genCodes = loadGeneratedCodes();
  if (genCodes[code]) {
    if (genCodes[code].used) {
      return { valid: false, message: 'Code already used' };
    }
    return {
      valid: true,
      days: genCodes[code].days || 30,
      type: genCodes[code].type || 'receipt',
      userId: genCodes[code].userId
    };
  }

  const upperCode = code.toUpperCase().trim();
  if (ALL_CODES[upperCode]) {
    const codeInfo = ALL_CODES[upperCode];
    if (codeInfo.usedBy && codeInfo.usedBy.length >= codeInfo.maxUsers) {
      return { valid: false, message: 'Code max uses reached' };
    }
    return {
      valid: true,
      days: codeInfo.days,
      type: codeInfo.type,
      code: upperCode
    };
  }

  return { valid: false, message: 'Invalid code' };
}

function markCodeUsed(code, userId) {
  const upperCode = code.toUpperCase().trim();

  const genCodes = loadGeneratedCodes();
  if (genCodes[code]) {
    genCodes[code].used = true;
    genCodes[code].usedAt = new Date().toISOString();
    genCodes[code].usedByUser = userId;
    saveGeneratedCodes(genCodes);
    return true;
  }

  if (ALL_CODES[upperCode]) {
    if (!ALL_CODES[upperCode].usedBy) ALL_CODES[upperCode].usedBy = [];
    ALL_CODES[upperCode].usedBy.push(userId);
    return true;
  }

  return false;
}

// ====== Receipt Hash (duplicate detection) ======
function checkReceiptHash(imageBuffer) {
  const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
  const hashes = loadReceiptHashes();

  if (hashes.includes(hash)) {
    log('DUPLICATE receipt detected! Hash: ' + hash.substring(0, 16));
    return true;
  }

  hashes.push(hash);
  if (hashes.length > 200) hashes.splice(0, hashes.length - 200);
  saveReceiptHashes(hashes);
  return false;
}

// ====== Message Templates ======
const WELCOME = `مرحباً بك في OptiSize! 👁️

كيف يمكنني مساعدتك؟

1️⃣ اشتراك - اشترك في مركز صحة العين VIP
2️⃣ تحدث - تحدث مع فريق الدعم

أرسل الرقم أو الكلمة 👇`;

const SUB_INFO = `💎 اشتراك مركز صحة العين VIP

قيمة الاشتراك: 50 جنيه شهرياً

💰 طريقة الدفع:
حول 50 جنيه على رقم:
📱 01028900122

📅 ${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
🕐 ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}

(فودافون كاش / إنستاباي / أي طريقة تحويل)

بعد الدفع أرسل صورة تأكيد الدفع هنا ✅

📸 تأكد أن الصورة توضح:
- الرقم المحول ليه (01028900122)
- المبلغ (50 جنيه)
- تاريخ ووقت التحويل

أو لو معاك كود اشتراك ابعتله مباشرة 👇`;

const CODE_ACCEPTED = `✅ تم تفعيل الاشتراك!

🔑 كود التفعيل: {CODE}

ادخل الكود في تطبيق OptiSize في مركز صحة العين
⏰ صالح لمدة {DAYS} يوم

شكراً لاشتراكك! 🙏`;

const RECEIPT_ACCEPTED = `✅ تم تأكيد الدفع!

🔑 كود التفعيل: {CODE}

ادخل الكود في تطبيق OptiSize في مركز صحة العين
⏰ صالح لمدة شهر

شكراً لاشتراكك! 🙏`;

const RECEIPT_REJECTED = `❌ الإيصال غير مقبول.
السبب: {REASON}

تأكد إن الإيصال بيوضح:
- كلمة تدل على الدفع (تم التحويل/تم الدفع)
- الرقم: 01028900122
- المبلغ: 50 جنيه بالظبط
- تاريخ ووقت التحويل (اليوم أو أمس)

أي طريقة دفع مقبولة (فودافون كاش / إنستاباي / تحويل بنكي)

أرسل صورة الإيصال الصحيحة تاني ✅`;

// ====== Receipt AI Verification ======
const RECEIPT_VERIFY_PROMPT = `أنت نظام تحقق صارم من إيصالات الدفع والتحويل.

الخطوة 1: أولاً تأكد إن الصورة دي فعلاً إيصال دفع أو تحويل
- لازم تشوف كلمات تدل على الدفع أو التحويل زي: "تم التحويل" أو "مرسل" أو "تم الإرسال" أو "تحويل ناجح" أو "تم الدفع" أو "دفع ناجح" أو "Sent" أو "Transferred" أو "Payment" أو "Paid"
- لو مفيش كلمات تدل على إن فيه دفع أو تحويل حصل -> مش إيصال دفع -> مرفوض

الخطوة 2: استخرج البيانات من الإيصال
1. الرقم المحول ليه أو رقم المستقبل
2. المبلغ المحول بالظبط
3. تاريخ التحويل (يوم/شهر/سنة)
4. وقت التحويل (ساعة:دقيقة)
5. طريقة الدفع (فودافون كاش / إنستاباي / تحويل بنكي / غيرها)

الخطوة 3: تحقق من البيانات
- الرقم لازم يكون 01028900122 بالظبط
- المبلغ لازم يكون 50 جنيه بالظبط - لو أي مبلغ تاني -> مرفوض
- التاريخ لازم يكون تاريخ اليوم أو أمس فقط - لو التاريخ أقدم من كده -> مرفوض
- الوقت لازم يكون موجود وواضح
- طريقة الدفع ممكن تكون أي طريقة (فودافون كاش، إنستاباي، تحويل بنكي، إلخ)

تحذيرات مهمة:
- لو المبلغ مش 50 جنيه بالظبط -> مرفوض
- لو التاريخ أقدم من أمس -> مرفوض
- لو مفيش كلمة تدل على الدفع أو التحويل -> مرفوض
- لو الصورة مش إيصال دفع -> مرفوض
- لو الصورة معدلة أو فيها تعديل -> مرفوض
- لو الإيصال مكرر أو مستخدم قبل كده -> مرفوض
- طريقة الدفع مش شرط تكون فودافون كاش - أي طريقة مقبولة

أجب بالتنسيق ده بالظبط (مهم جداً تلتزم بالتنسيق):
TYPE: [إيصال دفع / مش إيصال / أخرى]
KEYWORD: [الكلمة اللي تدل على الدفع أو "لا يوجد"]
NUMBER: [الرقم المحول ليه]
AMOUNT: [المبلغ بالظبط]
DATE: [التاريخ]
TIME: [الوقت]
METHOD: [طريقة الدفع]
EDITED: [نعم / لا / مش واضح]
RESULT: مقبول
أو
RESULT: مرفوض
REASON: [سبب الرفض]`;

async function analyzeReceiptWithGemini(imageBuffer) {
  if (!geminiModel) {
    throw new Error('Gemini API not initialized. Set GEMINI_API_KEY env variable.');
  }

  const base64Image = imageBuffer.toString('base64');

  const result = await geminiModel.generateContent([
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image
      }
    },
    RECEIPT_VERIFY_PROMPT
  ]);

  const response = await result.response;
  const text = response.text();
  log('Gemini raw response: ' + text.substring(0, 500));
  return text;
}

function extractField(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
}

function verifyReceiptData(aiResponse) {
  const aiType = extractField(aiResponse, /TYPE:\s*(.+)/);
  const aiKeyword = extractField(aiResponse, /KEYWORD:\s*(.+)/);
  const aiNumber = extractField(aiResponse, /NUMBER:\s*(.+)/);
  const aiAmount = extractField(aiResponse, /AMOUNT:\s*(.+)/);
  const aiDate = extractField(aiResponse, /DATE:\s*(.+)/);
  const aiTime = extractField(aiResponse, /TIME:\s*(.+)/);
  const aiMethod = extractField(aiResponse, /METHOD:\s*(.+)/);
  const aiEdited = extractField(aiResponse, /EDITED:\s*(.+)/);
  const aiResult = extractField(aiResponse, /RESULT:\s*(مقبول|مرفوض)/);
  const aiReason = extractField(aiResponse, /REASON:\s*(.+)/);

  log('AI fields: type=' + aiType + ' keyword=' + aiKeyword + ' number=' + aiNumber + ' amount=' + aiAmount + ' date=' + aiDate + ' time=' + aiTime + ' result=' + aiResult);

  const REQUIRED_NUMBER = '01028900122';
  const REQUIRED_AMOUNT = '50';

  const isPaymentReceipt = aiType.includes('إيصال') || aiType.includes('دفع') || aiType.includes('Receipt');
  const hasPaymentKeyword = aiKeyword !== 'لا يوجد' && aiKeyword !== '' && aiKeyword !== 'لايوجد';
  const numberOk = aiNumber.includes(REQUIRED_NUMBER) || aiNumber.replace(/\s/g, '').includes(REQUIRED_NUMBER);

  const amountClean = aiAmount.replace(/\s/g, '');
  const amountHas50 = amountClean.includes(REQUIRED_AMOUNT);
  const amountHas500 = amountClean.includes('500');
  const amountHas5Only = /(^|[^\d])5($|[^\d])/.test(amountClean) && !amountHas50;
  const amountOk = amountHas50 && !amountHas500 && !amountHas5Only;

  const now = new Date();
  const todayDay = now.getDate();
  const todayMonth = now.getMonth() + 1;
  const todayYear = now.getFullYear();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yestDay = yesterday.getDate();
  const yestMonth = yesterday.getMonth() + 1;
  const yestYear = yesterday.getFullYear();

  const dateClean = aiDate.replace(/\s/g, '');

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
      if (aiDate.includes(monthName)) {
        const dayMatch = aiDate.match(/(\d{1,2})/);
        const yearMatch = aiDate.match(/(\d{4})/);
        if (dayMatch) {
          dateOk = checkDateMatch(parseInt(dayMatch[1]), monthNum, yearMatch ? parseInt(yearMatch[1]) : undefined);
        }
        if (dateOk) break;
      }
    }
  }

  const timeClean = aiTime.replace(/\s/g, '');
  const timeOk = timeClean !== '' &&
    aiTime !== 'لا يوجد' &&
    aiTime !== 'لايوجد' &&
    /\d{1,2}[:.]\d{2}/.test(timeClean) &&
    parseInt(timeClean.match(/\d{1,2}/)?.[0] || '99') < 24;

  const isEdited = aiEdited.includes('نعم') || aiEdited.includes('Yes') || aiEdited.includes('معدل');

  const allOk = isPaymentReceipt && hasPaymentKeyword && numberOk && amountOk && dateOk && timeOk && !isEdited && aiResult === 'مقبول';

  let reason = '';
  if (!isPaymentReceipt) reason = 'الصورة مش إيصال دفع';
  else if (!hasPaymentKeyword) reason = 'مفيش كلمة تدل على إن فيه دفع أو تحويل حصل (زي "تم التحويل" أو "تم الدفع")';
  else if (isEdited) reason = 'الإيصال يبدو إنه معدل أو فيه تعديل';
  else if (!numberOk && !amountOk) reason = 'الرقم والمبلغ مختلفين عن المطلوب (01028900122 - 50 جنيه)';
  else if (!numberOk) reason = 'الرقم المحول ليه مختلف عن 01028900122';
  else if (!amountOk) reason = 'المبلغ مختلف عن 50 جنيه (المبلغ في الإيصال: ' + aiAmount + ')';
  else if (!dateOk) reason = 'التاريخ مش تاريخ اليوم أو أمس (التاريخ في الإيصال: ' + aiDate + ')';
  else if (!timeOk) reason = 'مفيش وقت واضح للتحويل في الإيصال';
  else if (aiResult !== 'مقبول') reason = aiReason || 'الإيصال غير مقبول';

  return {
    verified: allOk,
    reason,
    details: {
      type: aiType, keyword: aiKeyword, number: aiNumber,
      amount: aiAmount, date: aiDate, time: aiTime,
      method: aiMethod, edited: aiEdited, aiResult
    }
  };
}

async function handleReceipt(msg, bot) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  await bot.sendMessage(chatId, '⏳ جاري مراجعة إيصال الدفع...');

  try {
    // Download the photo
    const photo = msg.photo[msg.photo.length - 1]; // highest resolution
    const fileLink = await bot.getFileLink(photo.file_id);

    // Download image
    const https = require('https');
    const http_req = fileLink.startsWith('https') ? https : require('http');

    const imageBuffer = await new Promise((resolve, reject) => {
      http_req.get(fileLink, (res) => {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    });

    log('Receipt image downloaded, size: ' + (imageBuffer.length / 1024).toFixed(1) + 'KB');

    // Check for duplicate receipt
    if (checkReceiptHash(imageBuffer)) {
      userStates[userId] = 'awaiting_receipt';
      await bot.sendMessage(chatId, RECEIPT_REJECTED.replace('{REASON}', 'الإيصال ده تم استخدامه قبل كده! كل إيصال بيتستخدم مرة واحدة بس'));
      return;
    }

    // Analyze with Gemini
    const aiResponse = await analyzeReceiptWithGemini(imageBuffer);
    const verification = verifyReceiptData(aiResponse);

    if (verification.verified) {
      // Generate activation code
      const code = generateActivationCode(userId);
      await saveCodeToApp(code, userId);

      const msg_text = RECEIPT_ACCEPTED.replace('{CODE}', code);
      await bot.sendMessage(chatId, msg_text);
      log('Receipt accepted, code generated: ' + code + ' for user: ' + userId);
      userStates[userId] = 'subscribed';
    } else {
      userStates[userId] = 'awaiting_receipt';
      await bot.sendMessage(chatId, RECEIPT_REJECTED.replace('{REASON}', verification.reason));
      log('Receipt rejected: ' + verification.reason);
    }

  } catch (e) {
    log('Receipt handling error: ' + e.message);
    await bot.sendMessage(chatId, '❌ حصل خطأ أثناء مراجعة الإيصال. جرب تاني.');
    userStates[userId] = 'awaiting_receipt';
  }
}

// ====== Handle Code Entry ======
async function handleCodeEntry(chatId, userId, code, bot) {
  const codeInfo = ALL_CODES[code];

  if (!codeInfo) {
    const genCodes = loadGeneratedCodes();
    if (genCodes[code]) {
      if (genCodes[code].used) {
        await bot.sendMessage(chatId, '❌ الكود ده تم استخدامه قبل كده!');
        return;
      }
      await saveCodeToApp(code, userId);
      const msg_text = CODE_ACCEPTED.replace('{CODE}', code).replace('{DAYS}', genCodes[code].days || 30);
      await bot.sendMessage(chatId, msg_text);
      log('Code accepted: ' + code + ' for user: ' + userId);
      return;
    }

    await bot.sendMessage(chatId, '❌ كود التفعيل غير صحيح!\n\nتأكد إن الكود صح وجرب تاني\nأو ابعت صورة إيصال الدفع');
    return;
  }

  if (codeInfo.usedBy && codeInfo.usedBy.length >= codeInfo.maxUsers) {
    await bot.sendMessage(chatId, '❌ الكود ده وصل للحد الأقصى للاستخدام!');
    return;
  }

  if (!codeInfo.usedBy) codeInfo.usedBy = [];
  codeInfo.usedBy.push(userId);
  await saveCodeToApp(code, userId);

  const msg_text = CODE_ACCEPTED.replace('{CODE}', code).replace('{DAYS}', codeInfo.days);
  await bot.sendMessage(chatId, msg_text);
  log('Builtin code accepted: ' + code + ' (' + codeInfo.type + ') for user: ' + userId);
}

// ====== Bot Setup ======
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const WEBHOOK_URL = process.env.WEBHOOK_URL || ''; // e.g. https://optisize-bot.fly.dev/webhook
const PORT = process.env.PORT || 8080;

if (!BOT_TOKEN) {
  console.error('ERROR: BOT_TOKEN not set! Get it from @BotFather on Telegram.');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, WEBHOOK_URL ? { webHook: { port: PORT, host: '0.0.0.0' } } : { polling: true });

// Set webhook if URL provided
if (WEBHOOK_URL) {
  bot.setWebHook(WEBHOOK_URL).then(() => {
    log('Webhook set to: ' + WEBHOOK_URL);
  }).catch(e => {
    log('Webhook set failed: ' + e.message);
  });
}

log('OptiSize Telegram Bot starting...');
log('Mode: ' + (WEBHOOK_URL ? 'Webhook' : 'Polling'));

// ====== Express server for health checks and API ======
const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: WEBHOOK_URL ? 'webhook' : 'polling',
    geminiReady: !!geminiModel,
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  const genCodes = loadGeneratedCodes();
  res.json({
    status: 'ok',
    mode: WEBHOOK_URL ? 'webhook' : 'polling',
    geminiReady: !!geminiModel,
    generatedCodesCount: Object.keys(genCodes).length,
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Verify code API (for app)
app.post('/api/verify-code', (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.json({ valid: false, message: 'Code is required' });
  }
  const result = verifyCode(code);
  res.json(result);
});

// Use code API
app.post('/api/use-code', (req, res) => {
  const { code, userId } = req.body;
  if (!code) {
    return res.json({ success: false, message: 'Code is required' });
  }
  const marked = markCodeUsed(code, userId || '');
  res.json({ success: marked, message: marked ? 'Code marked as used' : 'Code not found' });
});

// List codes (admin)
app.get('/api/codes', (req, res) => {
  const genCodes = loadGeneratedCodes();
  res.json({
    generated: genCodes,
    builtin: Object.keys(ALL_CODES).map(k => ({
      code: k,
      type: ALL_CODES[k].type,
      days: ALL_CODES[k].days,
      maxUsers: ALL_CODES[k].maxUsers,
      usedCount: (ALL_CODES[k].usedBy || []).length
    }))
  });
});

// Logs endpoint
app.get('/log', (req, res) => {
  try {
    const logs = fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf-8') : '';
    res.type('text/plain').send(logs.slice(-8000));
  } catch {
    res.send('No logs');
  }
});

// If polling mode, start express separately
if (!WEBHOOK_URL) {
  app.listen(PORT, '0.0.0.0', () => {
    log('API server on :' + PORT);
  });
}

// Init Gemini after server starts
initGemini();

// ====== Bot Command Handlers ======

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  log('/start from user: ' + userId + ' (' + msg.from.first_name + ')');

  const opts = {
    reply_markup: {
      keyboard: [
        ['1️⃣ اشتراك', '2️⃣ تحدث'],
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };

  bot.sendMessage(chatId, WELCOME, opts);
  userStates[userId] = 'main';
});

// Photo handler (receipt)
bot.on('photo', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  log('Photo from user: ' + userId);

  if (userStates[userId] === 'awaiting_receipt' || userStates[userId] === 'subscription') {
    handleReceipt(msg, bot);
  } else {
    bot.sendMessage(chatId, WELCOME, {
      reply_markup: {
        keyboard: [['1️⃣ اشتراك', '2️⃣ تحدث']],
        resize_keyboard: true
      }
    });
  }
});

// Text message handler
bot.on('message', (msg) => {
  if (!msg.text) return; // skip non-text
  if (msg.text.startsWith('/')) return; // skip commands (handled separately)

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text.trim();

  log('Message from ' + userId + ': ' + text);

  // Admin chat mode
  if (adminChatActive[userId]) {
    if (text === 'انتهى' || text === 'انهى' || text === 'خلاص' || text === '0') {
      adminChatActive[userId] = false;
      bot.sendMessage(chatId, 'شكراً! 🙏\n\nلو محتاج حاجة تاني ابعتلي رسالة.', {
        reply_markup: {
          keyboard: [['1️⃣ اشتراك', '2️⃣ تحدث']],
          resize_keyboard: true
        }
      });
    }
    // In chat mode, just log (admin responds manually)
    log('Admin chat message from ' + userId + ': ' + text);
    return;
  }

  // Subscription option
  if (text === '1' || text === '1️⃣ اشتراك' || text === 'اشتراك' || text === 'اشترك' || text === 'اشتراكي') {
    userStates[userId] = 'awaiting_receipt';
    bot.sendMessage(chatId, SUB_INFO);
  }
  // Chat option
  else if (text === '2' || text === '2️⃣ تحدث' || text === 'تحدث' || text === 'تكلم' || text === 'دعم' || text === 'مساعدة') {
    adminChatActive[userId] = true;
    bot.sendMessage(chatId, '👤 تم تحويلك لفريق الدعم.\nلإنهاء المحادثة أرسل: انتهى', {
      reply_markup: {
        keyboard: [['انتهى']],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    });
  }
  // Check if it's a subscription code
  else if (text.length === 8 && /^[A-Z0-9]{8}$/i.test(text)) {
    handleCodeEntry(chatId, userId, text.toUpperCase(), bot);
  }
  // Also check for known codes of any length
  else if (ALL_CODES[text.toUpperCase()]) {
    handleCodeEntry(chatId, userId, text.toUpperCase(), bot);
  }
  // Default: welcome
  else {
    bot.sendMessage(chatId, WELCOME, {
      reply_markup: {
        keyboard: [['1️⃣ اشتراك', '2️⃣ تحدث']],
        resize_keyboard: true
      }
    });
  }
});

// Admin commands
bot.onText(/\/admin/, (msg) => {
  const userId = msg.from.id.toString();
  if (!adminIds.includes(userId)) {
    return bot.sendMessage(msg.chat.id, '❌ مش مسموح');
  }

  const genCodes = loadGeneratedCodes();
  const stats = `
📊 **لوحة التحكم**

🔑 أكواد مولّدة: ${Object.keys(genCodes).length}
👥 أعضاء: ${Object.keys(userStates).length}

💎 أكواد Master:
${Object.keys(MASTER_CODES).map(k => `- ${k}: ${(MASTER_CODES[k].usedBy || []).length}/${MASTER_CODES[k].maxUsers}`).join('\n')}

📋 أكواد Normal:
${Object.keys(NORMAL_CODES).map(k => `- ${k}: ${(NORMAL_CODES[k].usedBy || []).length}/${NORMAL_CODES[k].maxUsers}`).join('\n')}

🎁 أكواد Gift:
${Object.keys(GIFT_CODES).map(k => `- ${k}: ${(GIFT_CODES[k].usedBy || []).length}/${GIFT_CODES[k].maxUsers}`).join('\n')}
  `;

  bot.sendMessage(msg.chat.id, stats, { parse_mode: 'Markdown' });
});

// Broadcast command (admin only)
bot.onText(/\/broadcast (.+)/, (msg, match) => {
  const userId = msg.from.id.toString();
  if (!adminIds.includes(userId)) return;

  const message = match[1];
  // In a real app, you'd iterate over all user IDs
  bot.sendMessage(msg.chat.id, '📢 تم إرسال الرسالة لكل المستخدمين\n(مميزة كاملة في الإصدار القادم)');
});

// Keep-alive ping (for polling mode)
if (!WEBHOOK_URL) {
  setInterval(() => {
    bot.getMe().then(me => {
      log('Keep-alive ping OK: @' + me.username);
    }).catch(e => {
      log('Keep-alive ping failed: ' + e.message);
    });
  }, 300000); // every 5 minutes
}

log('OptiSize Telegram Bot v1.0 is ready! 🚀');
