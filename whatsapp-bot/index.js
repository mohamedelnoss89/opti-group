// ====== OptiSize WhatsApp Bot - Gemini AI Version ======
// Uses Google Gemini API for receipt verification (works from anywhere)

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,   // STANDALONE in Baileys v7, NOT sock.downloadMediaMessage
  getContentType,
  isLidUser,
  isJidGroup,
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const crypto = require('crypto');

// ====== Gemini AI Setup ======
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
let genAI = null;
let geminiModel = null;

function initGemini() {
  if (!GEMINI_API_KEY) {
    log('WARNING: GEMINI_API_KEY not set! Receipt verification will not work.');
    log('Get a free key from: https://aistudio.google.com/apikey');
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    log('AI: Gemini API initialized successfully');
    return true;
  } catch (e) {
    log('AI: Gemini init failed: ' + e.message);
    return false;
  }
}

// ====== Paths ======
const CODES_FILE = path.join(__dirname, 'subscription_codes.json');
const PAIRING_FILE = path.join(__dirname, '..', 'public', 'pairing.json');
const LOG_FILE = path.join(__dirname, 'bot.log');
const PID_FILE = path.join(__dirname, 'bot.pid');
const AUTH_PATH = path.join(__dirname, 'auth_info');

// ====== State ======
let userStates = {};
let ownerChatActive = {};
let botConnected = false;
let sock = null;
let presenceInterval = null;
let reconnectAttempts = 0;
const MAX_RECONNECT = 10;

// ====== LID to Phone Mapping ======
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

// ====== Message Deduplication ======
const processedMsgIds = new Set();
const MAX_DEDUP_SIZE = 500;

function isDuplicate(msgId) {
  if (processedMsgIds.has(msgId)) return true;
  processedMsgIds.add(msgId);
  if (processedMsgIds.size > MAX_DEDUP_SIZE) {
    const arr = [...processedMsgIds];
    arr.splice(0, 200).forEach(id => processedMsgIds.delete(id));
  }
  return false;
}

// ====== Anti-Ban: Rate Limiting ======
const messageTimestamps = {};
const MAX_PER_USER_HOUR = 15;
const MAX_TOTAL_HOUR = 40;
let totalMessagesSent = [];
const MIN_BETWEEN_MS = 2000;
const TYPING_DELAY_MS = 1500;
const MIN_RESPONSE_MS = 3000;
const lastResponseTime = {};

function isRateLimited(phone) {
  const now = Date.now();
  const ago = now - 3600000;
  totalMessagesSent = totalMessagesSent.filter(t => t > ago);
  if (totalMessagesSent.length >= MAX_TOTAL_HOUR) return true;
  if (!messageTimestamps[phone]) messageTimestamps[phone] = [];
  messageTimestamps[phone] = messageTimestamps[phone].filter(t => t > ago);
  if (messageTimestamps[phone].length >= MAX_PER_USER_HOUR) return true;
  return false;
}

function recordMsgSent(phone) {
  const now = Date.now();
  totalMessagesSent.push(now);
  if (!messageTimestamps[phone]) messageTimestamps[phone] = [];
  messageTimestamps[phone].push(now);
}

function canRespond(phone) {
  const now = Date.now();
  if (lastResponseTime[phone] && (now - lastResponseTime[phone]) < MIN_RESPONSE_MS) return false;
  return true;
}

function recordResponse(phone) { lastResponseTime[phone] = Date.now(); }

// ====== PID Lock (prevent duplicate processes) ======
function checkAndWritePID() {
  try {
    if (fs.existsSync(PID_FILE)) {
      const oldPid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim());
      if (oldPid && !isNaN(oldPid)) {
        if (oldPid === process.pid) {
          log('PID file has our own PID, continuing...');
        } else {
          try {
            process.kill(oldPid, 0);
            console.log('Another bot instance is already running (PID ' + oldPid + '). Exiting.');
            process.exit(1);
          } catch {
            log('Stale PID ' + oldPid + ' found, taking over...');
          }
        }
      }
    }
    fs.writeFileSync(PID_FILE, String(process.pid));
  } catch (e) { log('PID check: ' + e.message); }
}

// ====== Logging ======
function log(msg) {
  const ts = new Date().toISOString();
  const line = '[' + ts + '] ' + msg;
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch { console.log(line); }
}

// ====== File Helpers ======
function writePairingStatus(data) {
  try { fs.writeFileSync(PAIRING_FILE, JSON.stringify(data)); } catch {}
}

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

async function saveSubscriptionToDB(code, phone) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try { await prisma.subscription.create({ data: { code, phone, isActive: false } }); }
    catch (e) {
      const c = loadCodes();
      c[code] = { phone, createdAt: new Date().toISOString(), activated: false };
      saveCodes(c);
    }
    finally { await prisma.$disconnect(); }
  } catch (e) {
    log('DB fallback: ' + e.message);
    const c = loadCodes();
    c[code] = { phone, createdAt: new Date().toISOString(), activated: false };
    saveCodes(c);
  }
}

// ====== Message Templates ======
const WELCOME = 'مرحباً بك في OptiSize! 👁️\n\nكيف يمكنني مساعدتك؟\n\n1️⃣ اشتراك - اشترك في مركز صحة العين VIP\n2️⃣ تحدث - تحدث مع فريق الدعم\n\nأرسل الرقم أو الكلمة 👇';

const SUB_INFO = '💎 اشتراك مركز صحة العين VIP\n\nقيمة الاشتراك: 50 جنيه شهرياً\n\n💰 طريقة الدفع:\nحول 50 جنيه على رقم:\n📱 01028900122\n\n(فودافون كاش / إنستاباي / أي طريقة تحويل)\n\nبعد الدفع أرسل صورة تأكيد الدفع هنا ✅\n\n📸 تأكد أن الصورة توضح:\n- الرقم المحول ليه (01028900122)\n- المبلغ (50 جنيه)\n- تاريخ ووقت التحويل';

// ====== Presence ======
async function setOnline() {
  if (!sock || !botConnected) return;
  try { await sock.sendPresenceUpdate('available'); } catch {}
}

function startPresenceKeepAlive() {
  if (presenceInterval) clearInterval(presenceInterval);
  setTimeout(setOnline, 10000);
  presenceInterval = setInterval(setOnline, 120000);
}

function stopPresenceKeepAlive() {
  if (presenceInterval) { clearInterval(presenceInterval); presenceInterval = null; }
}

// ====== Safe Send ======
async function safeSend(jid, content) {
  if (!sock || !botConnected) { log('Cannot send: not connected'); return false; }
  const phone = jid.replace('@s.whatsapp.net', '').replace('@lid', '');
  if (isRateLimited(phone)) { log('Rate limited: ' + phone); return false; }
  try {
    await sock.sendMessage(jid, content);
    recordMsgSent(phone);
    log('Sent to ' + phone);
    return true;
  } catch (e) {
    log('Send error: ' + e.message);
    return false;
  }
}

// ====== HTTP API ======
http.createServer(async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  if (req.url === '/status') {
    res.end(JSON.stringify({ connected: botConnected, uptime: process.uptime(), pid: process.pid, sent: totalMessagesSent.length, geminiReady: !!geminiModel }));
    return;
  }
  if (req.url === '/log') {
    try {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end((fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf-8') : '').slice(-5000));
    } catch { res.end('No logs'); }
    return;
  }
  res.end(JSON.stringify({ status: 'ok', connected: botConnected, pid: process.pid, geminiReady: !!geminiModel }));
}).listen(process.env.PORT || 8787, '0.0.0.0', () => {
  log('API on :' + (process.env.PORT || 8787));
  initGemini();
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
        try {
          const QRCode = require('qrcode-terminal');
          QRCode.generate(qr, { small: true });
          console.log('\n📱 Scan this QR code with WhatsApp!\n');
        } catch (e) { console.log('QR Error: ' + e.message); }
        try {
          const QRCodeFile = require('qrcode');
          await QRCodeFile.toFile(path.join(__dirname, '..', 'public', 'whatsapp-qr.png'), qr, { width: 400, margin: 2 });
          writePairingStatus({ status: 'ready', qrAvailable: true });
        } catch {}
        log('QR code generated');
      }
      
      if (connection === 'close') {
        botConnected = false;
        stopPresenceKeepAlive();
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        log('Connection closed. Status: ' + statusCode);
        
        if (statusCode !== DisconnectReason.loggedOut && reconnectAttempts < MAX_RECONNECT) {
          reconnectAttempts++;
          const delay = Math.min(5000 * reconnectAttempts, 60000);
          log('Reconnecting in ' + (delay/1000) + 's (attempt ' + reconnectAttempts + '/' + MAX_RECONNECT + ')...');
          setTimeout(startWA, delay);
        } else if (statusCode === DisconnectReason.loggedOut) {
          writePairingStatus({ status: 'logged_out' });
          log('Logged out. Need to re-pair.');
          reconnectAttempts = 0;
        }
      }
      
      if (connection === 'open') {
        botConnected = true;
        reconnectAttempts = 0;
        log('WHATSAPP CONNECTED!');
        writePairingStatus({ status: 'connected' });
        startPresenceKeepAlive();
      }
    });
    
    // ====== MESSAGE HANDLER ======
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        const m = messages[0];
        if (!m) return;
        if (!m.message) return;
        if (m.key.fromMe) return;
        
        const from = m.key.remoteJid;
        const msgId = m.key.id;
        
        if (isDuplicate(msgId)) {
          log('Duplicate: ' + msgId);
          return;
        }
        
        const msgTypes = Object.keys(m.message).join(',');
        log('[' + type + '] from=' + from + ' types=' + msgTypes);
        
        if (type !== 'notify' && type !== 'append') return;
        if (from.endsWith('@g.us') || from.endsWith('@newsletter')) return;
        
        // ====== Resolve JID to phone number ======
        let phone = '';
        let respondTo = from;
        
        if (from.endsWith('@s.whatsapp.net')) {
          phone = from.replace('@s.whatsapp.net', '');
        } else if (from.endsWith('@lid')) {
          const resolvedPhone = resolveLidToPhone(from);
          if (resolvedPhone) {
            phone = resolvedPhone;
            respondTo = resolvedPhone + '@s.whatsapp.net';
            log('LID ' + from + ' -> ' + resolvedPhone);
          } else {
            phone = from.replace('@lid', '');
            respondTo = from;
            log('Unresolved LID: ' + from + ', will try responding to LID');
          }
        } else {
          log('Unknown JID type: ' + from);
          return;
        }
        
        if (!canRespond(phone)) {
          log('Cooldown: ' + phone);
          return;
        }
        
        const text = m.message?.conversation 
          || m.message?.extendedTextMessage?.text 
          || m.message?.imageMessage?.caption 
          || '';
        
        log('DM from ' + phone + ': ' + (text || '[IMAGE]'));
        
        await new Promise(r => setTimeout(r, 800));
        try { await sock.readMessages([m.key]); } catch {}
        
        try { await sock.sendPresenceUpdate('composing', respondTo); } catch {}
        await new Promise(r => setTimeout(r, Math.min(Math.max(TYPING_DELAY_MS, text.length * 30), 2500)));
        
        recordResponse(phone);
        
        // ====== Owner chat mode ======
        if (ownerChatActive[phone]) {
          if (text.trim() === '\u0627\u0646\u062A\u0647\u0649' || text.trim() === '\u0627\u0646\u0647\u0649') {
            ownerChatActive[phone] = false;
            await safeSend(respondTo, { text: '\u0634\u0643\u0631\u0627\u064B! \uD83D\uDE4F' });
          }
          try { await sock.sendPresenceUpdate('available'); } catch {}
          return;
        }
        
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
        if (cmd === '1' || cmd === '\u0627\u0634\u062A\u0631\u0627\u0643' || cmd === '\u0627\u0634\u062A\u0631\u0643') {
          userStates[phone] = 'awaiting_receipt';
          await safeSend(respondTo, { text: SUB_INFO });
        } else if (cmd === '2' || cmd === '\u062A\u062D\u062F\u062B') {
          ownerChatActive[phone] = true;
          await safeSend(respondTo, { text: '\uD83D\uDC64 \u062A\u0645 \u062A\u062D\u0648\u064A\u0644\u0643 \u0644\u0641\u0631\u064A\u0642 \u0627\u0644\u062F\u0639\u0645.\n\u0644\u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0623\u0631\u0633\u0644: \u0627\u0646\u062A\u0647\u0649' });
        } else {
          await safeSend(respondTo, { text: WELCOME });
        }
        
        try { await sock.sendPresenceUpdate('available'); } catch {}
        
      } catch (err) {
        log('Handler error: ' + err.message + '\n' + (err.stack || ''));
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

// ====== Receipt Handler (uses Gemini AI directly) ======

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
- طريقة الدفع مش شرط تكون فودافون كاش - أي طريقة مقبولة

أجب بالتنسيق ده بالظبط (مهم جداً تلتزم بالتنسيق):
TYPE: [إيصال دفع / مش إيصال / أخرى]
KEYWORD: [الكلمة اللي تدل على الدفع أو "لا يوجد"]
NUMBER: [الرقم المحول ليه]
AMOUNT: [المبلغ بالظبط]
DATE: [التاريخ]
TIME: [الوقت]
METHOD: [طريقة الدفع]
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
  const aiResult = extractField(aiResponse, /RESULT:\s*(مقبول|مرفوض)/);
  const aiReason = extractField(aiResponse, /REASON:\s*(.+)/);

  log('AI fields: type=' + aiType + ' keyword=' + aiKeyword + ' number=' + aiNumber + ' amount=' + aiAmount + ' date=' + aiDate + ' time=' + aiTime + ' method=' + aiMethod + ' result=' + aiResult);

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

  // Try DD/MM/YYYY or DD-MM-YYYY format
  const slashMatch = dateClean.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (slashMatch) {
    const d = parseInt(slashMatch[1]);
    const m = parseInt(slashMatch[2]);
    let y = parseInt(slashMatch[3]);
    if (y < 100) y += 2000;
    dateOk = checkDateMatch(d, m, y);
  }

  // Try YYYY/MM/DD or YYYY-MM-DD format
  if (!dateOk) {
    const isoMatch = dateClean.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (isoMatch) {
      dateOk = checkDateMatch(parseInt(isoMatch[3]), parseInt(isoMatch[2]), parseInt(isoMatch[1]));
    }
  }

  // Try Arabic month names
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

  const allOk = isPaymentReceipt && hasPaymentKeyword && numberOk && amountOk && dateOk && timeOk && aiResult === 'مقبول';

  // Build specific rejection reason
  let reason = '';
  if (!isPaymentReceipt) reason = 'الصورة مش إيصال دفع';
  else if (!hasPaymentKeyword) reason = 'مفيش كلمة تدل على إن فيه دفع أو تحويل حصل (زي "تم التحويل" أو "تم الدفع")';
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
      type: aiType,
      keyword: aiKeyword,
      number: aiNumber,
      amount: aiAmount,
      date: aiDate,
      time: aiTime,
      method: aiMethod,
      aiResult
    }
  };
}

async function handleReceipt(from, phone, msg) {
  await safeSend(from, { text: '⏳ جاري مراجعة إيصال الدفع...' });
  await new Promise(r => setTimeout(r, 1500));
  
  try {
    // Download the image
    const buf = await downloadMediaMessage(
      msg,
      'buffer',
      {},
      { logger: undefined, reuploadRequest: undefined }
    );
    
    log('Receipt image downloaded, size: ' + (buf.length / 1024).toFixed(1) + 'KB');
    
    try {
      // Check if Gemini is available
      if (!geminiModel) {
        log('Gemini not initialized, cannot verify receipt');
        userStates[phone] = 'awaiting_receipt';
        await safeSend(from, { 
          text: '❌ الإيصال غير مقبول.\nالسبب: خدمة التحقق مش متاحة حالياً، حاول تاني بعد شوية\n\nتأكد إن الإيصال بيوضح:\n- كلمة تدل على الدفع (تم التحويل/تم الدفع)\n- الرقم: 01028900122\n- المبلغ: 50 جنيه بالظبط\n- تاريخ ووقت التحويل (اليوم أو أمس)\n\nأي طريقة دفع مقبولة (فودافون كاش / إنستاباي / تحويل بنكي)\n\nأرسل صورة الإيصال الصحيحة تاني ✅' 
        });
        return;
      }
      
      // Analyze with Gemini
      log('Sending receipt to Gemini AI for analysis...');
      const aiResponse = await analyzeReceiptWithGemini(buf);
      
      // Verify the receipt data
      const result = verifyReceiptData(aiResponse);
      
      log('Verification result: verified=' + result.verified + ' reason=' + result.reason);
      
      if (result.verified) {
        const code = generateCode(phone);
        await saveSubscriptionToDB(code, phone);
        userStates[phone] = 'idle';
        await safeSend(from, { text: '✅ تم تأكيد الدفع!\n\n🔑 كود الاشتراك: ' + code + '\n\nادخل الكود في OptiSize في مركز صحة العين\n⏰ صالح لمدة شهر\nشكراً لاشتراكك! 🙏' });
        log('Receipt ACCEPTED for ' + phone + ', code: ' + code);
        return;
      }
      
      // Rejected - give SPECIFIC reason
      userStates[phone] = 'awaiting_receipt';
      await safeSend(from, { 
        text: '❌ الإيصال غير مقبول.\nالسبب: ' + result.reason + '\n\nتأكد إن الإيصال بيوضح:\n- كلمة تدل على الدفع (تم التحويل/تم الدفع)\n- الرقم: 01028900122\n- المبلغ: 50 جنيه بالظبط\n- تاريخ ووقت التحويل (اليوم أو أمس)\n\nأي طريقة دفع مقبولة (فودافون كاش / إنستاباي / تحويل بنكي)\n\nأرسل صورة الإيصال الصحيحة تاني ✅' 
      });
      log('Receipt REJECTED for ' + phone + ': ' + result.reason);
      
    } catch (aiErr) {
      log('AI verify failed: ' + aiErr.message);
      userStates[phone] = 'awaiting_receipt';
      
      let reason = 'خدمة التحقق مش متاحة حالياً، حاول تاني بعد شوية';
      if (aiErr.message.includes('timeout')) reason = 'السيرفر بطيء حالياً، حاول تبعت الصورة تاني';
      else if (aiErr.message.includes('API key')) reason = 'مفيش اتصال بخدمة التحقق، حاول تاني بعد شوية';
      else if (aiErr.message.includes('quota')) reason = 'خدمة التحقق وصلت للحد المسموح، حاول تاني بعد ساعة';
      
      await safeSend(from, { 
        text: '❌ الإيصال غير مقبول.\nالسبب: ' + reason + '\n\nتأكد إن الإيصال بيوضح:\n- كلمة تدل على الدفع (تم التحويل/تم الدفع)\n- الرقم: 01028900122\n- المبلغ: 50 جنيه بالظبط\n- تاريخ ووقت التحويل (اليوم أو أمس)\n\nأي طريقة دفع مقبولة (فودافون كاش / إنستاباي / تحويل بنكي)\n\nأرسل صورة الإيصال الصحيحة تاني ✅' 
      });
      log('Receipt REJECTED (AI error) for ' + phone + ': ' + aiErr.message);
    }
  } catch (e) {
    log('Receipt download error: ' + e.message);
    userStates[phone] = 'awaiting_receipt';
    await safeSend(from, { text: '⚠️ حصل خطأ في تحميل الصورة. حاول تبعتها تاني.' });
  }
}

// ====== Process Handlers ======
process.on('uncaughtException', (err) => {
  log('Uncaught: ' + err.message);
});

process.on('unhandledRejection', (reason) => {
  log('Rejection: ' + (reason instanceof Error ? reason.message : String(reason)));
});

process.on('SIGINT', () => {
  log('SIGINT');
  stopPresenceKeepAlive();
  try { fs.unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('SIGTERM');
  stopPresenceKeepAlive();
  try { fs.unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});

process.on('exit', () => {
  try { fs.unlinkSync(PID_FILE); } catch {}
});

// ====== STARTUP ======
log('OptiSize Bot starting (Gemini AI version)...');
log('Node: ' + process.version + ' PID: ' + process.pid);
log('GEMINI_API_KEY: ' + (GEMINI_API_KEY ? 'SET (' + GEMINI_API_KEY.substring(0, 8) + '...)' : 'NOT SET'));

// Check PID lock before starting
checkAndWritePID();

// Clear old log (keep last 50KB)
try {
  if (fs.existsSync(LOG_FILE)) {
    const stat = fs.statSync(LOG_FILE);
    if (stat.size > 50000) {
      const content = fs.readFileSync(LOG_FILE, 'utf-8');
      fs.writeFileSync(LOG_FILE, content.slice(-20000));
    }
  }
} catch {}

// Load LID mappings
loadLidMappings();
