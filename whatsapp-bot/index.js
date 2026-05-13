// ====== OptiSize WhatsApp Bot v4.7 ======
// - Chrome browser fingerprint (no "Bot" - prevents QR scan failure)
// - Gemini AI for receipt verification
// - Code generation (8 chars) on receipt acceptance
// - API endpoints for app code verification
// - All subscription codes built-in
// - Chat mode + Anti-ban measures
// - QR code via qrcode lib + external API fallback

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
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
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    log('AI: Gemini API initialized successfully');
    return true;
  } catch (e) {
    log('AI: Gemini init failed: ' + e.message);
    return false;
  }
}

// ====== Paths ======
const CODES_FILE = path.join(__dirname, 'subscription_codes.json');
const GENERATED_CODES_FILE = path.join(__dirname, 'generated_codes.json');
const RECEIPT_HASHES_FILE = path.join(__dirname, 'receipt_hashes.json');
const LOG_FILE = path.join(__dirname, 'bot.log');
const PID_FILE = path.join(__dirname, 'bot.pid');
const AUTH_PATH = path.join(__dirname, 'auth_info');

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

// ====== PID Lock ======
function checkAndWritePID() {
  try {
    if (fs.existsSync(PID_FILE)) {
      const oldPid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim());
      if (oldPid && !isNaN(oldPid)) {
        if (oldPid === process.pid) return;
        try {
          process.kill(oldPid, 0);
          console.log('Another bot instance is already running (PID ' + oldPid + '). Exiting.');
          process.exit(1);
        } catch {
          log('Stale PID ' + oldPid + ' found, taking over...');
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
const APP_URL = process.env.APP_URL || '';  // e.g. https://your-app.vercel.com
const APP_SECRET = process.env.APP_SECRET || 'optisize-bot-2026';

// ====== Save code to app database ======
async function saveCodeToApp(code, phone) {
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
      body: JSON.stringify({ phone, code })
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
function generateActivationCode(phone) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const last4 = phone.replace(/\D/g, '').slice(-4);
  const codes = loadGeneratedCodes();
  let code;
  let attempts = 0;
  do {
    // Format: OPT + last 4 phone digits + 1 random char = 3 + 4 + 1 = 8
    const randChar = letters[Math.floor(Math.random() * 26)];
    code = 'OPT' + last4 + randChar;
    attempts++;
    if (attempts > 50) {
      // Fallback: fully random
      code = 'OPT' + digits[Math.floor(Math.random()*10)] + digits[Math.floor(Math.random()*10)] + letters[Math.floor(Math.random()*26)] + digits[Math.floor(Math.random()*10)] + letters[Math.floor(Math.random()*26)];
    }
  } while (codes[code] && attempts < 100);

  // Store the generated code
  codes[code] = {
    phone: phone,
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
  // Check generated codes first
  const genCodes = loadGeneratedCodes();
  if (genCodes[code]) {
    if (genCodes[code].used) {
      return { valid: false, message: 'Code already used' };
    }
    return {
      valid: true,
      days: genCodes[code].days || 30,
      type: genCodes[code].type || 'receipt',
      phone: genCodes[code].phone
    };
  }

  // Check built-in subscription codes
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

function markCodeUsed(code, phone) {
  const upperCode = code.toUpperCase().trim();

  // Check generated codes
  const genCodes = loadGeneratedCodes();
  if (genCodes[code]) {
    genCodes[code].used = true;
    genCodes[code].usedAt = new Date().toISOString();
    genCodes[code].usedByPhone = phone;
    saveGeneratedCodes(genCodes);
    return true;
  }

  // Check built-in codes
  if (ALL_CODES[upperCode]) {
    if (!ALL_CODES[upperCode].usedBy) ALL_CODES[upperCode].usedBy = [];
    ALL_CODES[upperCode].usedBy.push(phone);
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
    return true; // duplicate
  }

  hashes.push(hash);
  // Keep only last 200 hashes
  if (hashes.length > 200) hashes.splice(0, hashes.length - 200);
  saveReceiptHashes(hashes);
  return false;
}

// ====== Message Templates ======
const WELCOME = 'مرحباً بك في OptiSize! 👁️\n\nكيف يمكنني مساعدتك؟\n\n1️⃣ اشتراك - اشترك في مركز صحة العين VIP\n2️⃣ تحدث - تحدث مع فريق الدعم\n\nأرسل الرقم أو الكلمة 👇';

const SUB_INFO = '💎 اشتراك مركز صحة العين VIP\n\nقيمة الاشتراك: 50 جنيه شهرياً\n\n💰 طريقة الدفع:\nحول 50 جنيه على رقم:\n📱 01028900122\n\n📅 ' + new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '\n🕐 ' + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + '\n\n(فودافون كاش / إنستاباي / أي طريقة تحويل)\n\nبعد الدفع أرسل صورة تأكيد الدفع هنا ✅\n\n📸 تأكد أن الصورة توضح:\n- الرقم المحول ليه (01028900122)\n- المبلغ (50 جنيه)\n- تاريخ ووقت التحويل\n\nأو لو معاك كود اشتراك ابعتله مباشرة 👇';

const CODE_ACCEPTED = '✅ تم تفعيل الاشتراك!\n\n🔑 كود التفعيل: {CODE}\n\nادخل الكود في تطبيق OptiSize في مركز صحة العين\n⏰ صالح لمدة {DAYS} يوم\n\nشكراً لاشتراكك! 🙏';

const RECEIPT_ACCEPTED = '✅ تم تأكيد الدفع!\n\n🔑 كود التفعيل: {CODE}\n\nادخل الكود في تطبيق OptiSize في مركز صحة العين\n⏰ صالح لمدة شهر\n\nشكراً لاشتراكك! 🙏';

const RECEIPT_REJECTED = '❌ الإيصال غير مقبول.\nالسبب: {REASON}\n\nتأكد إن الإيصال بيوضح:\n- كلمة تدل على الدفع (تم التحويل/تم الدفع)\n- الرقم: 01028900122\n- المبلغ: 50 جنيه بالظبط\n- تاريخ ووقت التحويل (اليوم أو أمس)\n\nأي طريقة دفع مقبولة (فودافون كاش / إنستاباي / تحويل بنكي)\n\nأرسل صورة الإيصال الصحيحة تاني ✅';

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

// ====== QR Code Storage ======
let currentQRCode = null;
let currentPairingCode = null;

// ====== Delete Auth Folder ======
function deleteAuthFolder() {
  try {
    if (fs.existsSync(AUTH_PATH)) {
      fs.rmSync(AUTH_PATH, { recursive: true, force: true });
      log('Auth folder deleted successfully');
    }
  } catch (e) {
    log('Error deleting auth folder: ' + e.message);
  }
}

// ====== HTTP API Server ======
const PORT = process.env.PORT || 8080;

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  const method = req.method;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // ====== QR Code Page ======
  if (url === '/' || url === '/qr') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    if (botConnected) {
      res.end('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;background:#1a1a2e;color:#eee"><div style="text-align:center"><h1 style="color:#0f0">&#10004; البوت متصل ويعمل!</h1><p>OptiSize Bot v4.7 - Running</p></div></body></html>');
    } else if (currentQRCode) {
      res.end('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;background:#1a1a2e;color:#eee"><div style="text-align:center"><h2>&#128241; امسح كود QR بالواتساب</h2><p>واتساب > الإعدادات > الأجهزة المرتبطة > ربط جهاز</p><img src="' + currentQRCode + '" style="border:10px solid white;border-radius:10px;margin:20px"/><p style="color:#aaa">الكود بيتجدد كل 20 ثانية</p>' + (currentPairingCode ? '<p style="margin-top:20px">أو استخدم كود الربط: <b style="font-size:24px;color:#0f0">' + currentPairingCode + '</b></p><p style="color:#aaa">واتساب > الإعدادات > الأجهزة المرتبطة > الربط برقم الهاتف</p>' : '') + '</div></body></html>');
    } else {
      res.end('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;background:#1a1a2e;color:#eee"><div style="text-align:center"><h2>&#9203; جاري انتظار كود QR...</h2><p>البوت بيشتغل، حدث الصفحة بعد ثواني</p></div></body></html>');
    }
    return;
  }

  // ====== Reset Auth ======
  if (url === '/reset' && method === 'GET') {
    log('Reset requested via API');
    deleteAuthFolder();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Auth folder deleted. Bot will restart with new QR code.' }));
    setTimeout(() => process.exit(0), 1000);
    return;
  }

  // ====== Status ======
  if (url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const genCodes = loadGeneratedCodes();
    res.end(JSON.stringify({
      connected: botConnected,
      uptime: process.uptime(),
      pid: process.pid,
      geminiReady: !!geminiModel,
      totalMessagesSent: totalMessagesSent.length,
      generatedCodesCount: Object.keys(genCodes).length,
      pairingCode: currentPairingCode,
      version: '4.7.0'
    }));
    return;
  }

  // ====== Logs ======
  if (url === '/log') {
    try {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end((fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf-8') : '').slice(-8000));
    } catch { res.end('No logs'); }
    return;
  }

  // ====== Verify Code API (for app) ======
  if (url === '/api/verify-code' && method === 'POST') {
    try {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { code } = JSON.parse(body);
          if (!code) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ valid: false, message: 'Code is required' }));
            return;
          }
          const result = verifyCode(code);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ valid: false, message: 'Invalid request body' }));
        }
      });
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid: false, message: 'Server error' }));
    }
    return;
  }

  // ====== Use Code API (mark as used after app activation) ======
  if (url === '/api/use-code' && method === 'POST') {
    try {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { code, phone } = JSON.parse(body);
          if (!code) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Code is required' }));
            return;
          }
          const marked = markCodeUsed(code, phone || '');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: marked, message: marked ? 'Code marked as used' : 'Code not found' }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Invalid request body' }));
        }
      });
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Server error' }));
    }
    return;
  }

  // ====== List Generated Codes (admin) ======
  if (url === '/api/codes') {
    const genCodes = loadGeneratedCodes();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      generated: genCodes,
      builtin: Object.keys(ALL_CODES).map(k => ({
        code: k,
        type: ALL_CODES[k].type,
        days: ALL_CODES[k].days,
        maxUsers: ALL_CODES[k].maxUsers,
        usedCount: (ALL_CODES[k].usedBy || []).length
      }))
    }, null, 2));
    return;
  }

  // ====== Default ======
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    connected: botConnected,
    version: '4.7.0',
    geminiReady: !!geminiModel,
    endpoints: ['/', '/qr', '/status', '/log', '/reset', '/api/verify-code', '/api/use-code', '/api/codes']
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  log('API server on :' + PORT);
  initGemini();
  // Delay bot start to ensure server is ready
  setTimeout(startWA, 3000);
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
      browser: ['Chrome', 'Chrome', '120.0.0'],  // MUST NOT contain "Bot" - causes QR scan failure
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
        currentPairingCode = null;

        // Generate QR as base64 image
        try {
          const QRCode = require('qrcode');
          currentQRCode = await QRCode.toDataURL(qr, { width: 400, margin: 2 });
          log('QR code generated for web display');
        } catch (e) {
          log('QR library failed, using external API: ' + e.message);
          try {
            currentQRCode = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=' + encodeURIComponent(qr);
          } catch (e2) { log('External QR API also failed: ' + e2.message); }
        }

        // Pairing code
        try {
          const OWNER_PHONE = process.env.OWNER_PHONE || '201033346513';
          const pairingCode = await sock.requestPairingCode(OWNER_PHONE);
          currentPairingCode = pairingCode;
          console.log('\n========================================');
          console.log('PAIRING CODE: ' + pairingCode);
          console.log('========================================\n');
          log('Pairing code: ' + pairingCode);
        } catch (e) {
          log('Pairing code error: ' + e.message);
        }
      }

      if (connection === 'close') {
        botConnected = false;
        stopPresenceKeepAlive();
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const errorMsg = lastDisconnect?.error?.message || '';
        log('Connection closed. Status: ' + statusCode + ' Error: ' + errorMsg);

        // Handle MAC encryption error (code 515)
        if (statusCode === 515 || errorMsg.includes('MAC') || errorMsg.includes('mac')) {
          log('MAC encryption error detected - deleting auth and reconnecting...');
          deleteAuthFolder();
          setTimeout(startWA, 5000);
          return;
        }

        if (statusCode !== DisconnectReason.loggedOut && reconnectAttempts < MAX_RECONNECT) {
          reconnectAttempts++;
          const delay = Math.min(5000 * reconnectAttempts, 60000);
          log('Reconnecting in ' + (delay / 1000) + 's (attempt ' + reconnectAttempts + '/' + MAX_RECONNECT + ')...');
          setTimeout(startWA, delay);
        } else if (statusCode === DisconnectReason.loggedOut) {
          log('Logged out. Need to re-pair. Use /reset to clear auth.');
          reconnectAttempts = 0;
        }
      }

      if (connection === 'open') {
        botConnected = true;
        currentQRCode = null;
        currentPairingCode = null;
        reconnectAttempts = 0;
        log('WHATSAPP CONNECTED! Bot is active.');
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

        // ====== Resolve JID to phone ======
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
            log('Unresolved LID: ' + from);
          }
        } else {
          log('Unknown JID type: ' + from);
          return;
        }

        if (!canRespond(phone)) {
          log('Cooldown: ' + phone);
          return;
        }

        const text = (m.message?.conversation
          || m.message?.extendedTextMessage?.text
          || m.message?.imageMessage?.caption
          || '').trim();

        log('DM from ' + phone + ': ' + (text || '[IMAGE]'));

        // Mark as read
        await new Promise(r => setTimeout(r, 800));
        try { await sock.readMessages([m.key]); } catch {}

        // Show typing
        try { await sock.sendPresenceUpdate('composing', respondTo); } catch {}
        await new Promise(r => setTimeout(r, 1500));

        recordResponse(phone);

        // ====== Owner chat mode ======
        if (ownerChatActive[phone]) {
          if (text === 'انتهى' || text === 'انهى' || text === 'خلاص' || text === '0') {
            ownerChatActive[phone] = false;
            await safeSend(respondTo, { text: 'شكراً! 🙏\n\nلو محتاج حاجة تاني ابعتلي رسالة.' });
          }
          // In chat mode, owner messages are just logged (you respond manually from WhatsApp)
          try { await sock.sendPresenceUpdate('available'); } catch {}
          return;
        }

        // ====== Image (payment receipt) ======
        if (m.message?.imageMessage) {
          if (userStates[phone] === 'awaiting_receipt' || userStates[phone] === 'subscription') {
            await handleReceipt(respondTo, phone, m);
          } else {
            await safeSend(respondTo, { text: WELCOME });
          }
          try { await sock.sendPresenceUpdate('available'); } catch {}
          return;
        }

        // ====== Text commands ======
        const cmd = text.trim();

        // Subscription option
        if (cmd === '1' || cmd === 'اشتراك' || cmd === 'اشترك' || cmd === 'اشتراكي') {
          userStates[phone] = 'awaiting_receipt';
          await safeSend(respondTo, { text: SUB_INFO });
        }
        // Chat option
        else if (cmd === '2' || cmd === 'تحدث' || cmd === 'تكلم' || cmd === 'دعم' || cmd === 'مساعدة') {
          ownerChatActive[phone] = true;
          await safeSend(respondTo, { text: '👤 تم تحويلك لفريق الدعم.\nلإنهاء المحادثة أرسل: انتهى' });
        }
        // Check if it's a subscription code
        else if (cmd.length === 8 && /^[A-Z0-9]{8}$/i.test(cmd)) {
          await handleCodeEntry(respondTo, phone, cmd.toUpperCase());
        }
        // Also check for known codes of any length
        else if (ALL_CODES[cmd.toUpperCase()]) {
          await handleCodeEntry(respondTo, phone, cmd.toUpperCase());
        }
        // Default: welcome
        else {
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

// ====== Handle Code Entry ======
async function handleCodeEntry(from, phone, code) {
  const codeInfo = ALL_CODES[code];

  if (!codeInfo) {
    // Check generated codes
    const genCodes = loadGeneratedCodes();
    if (genCodes[code]) {
      if (genCodes[code].used) {
        await safeSend(from, { text: '❌ الكود ده تم استخدامه قبل كده!' });
        return;
      }
      // Valid generated code - save to app DB
      await saveCodeToApp(code, phone);
      const msg = CODE_ACCEPTED.replace('{CODE}', code).replace('{DAYS}', genCodes[code].days || 30);
      await safeSend(from, { text: msg });
      log('Code accepted: ' + code + ' for phone: ' + phone);
      return;
    }

    await safeSend(from, { text: '❌ كود التفعيل غير صحيح!\n\nتأكد إن الكود صح وجرب تاني\nأو ابعت صورة إيصال الدفع' });
    return;
  }

  // Check max uses
  if (codeInfo.usedBy && codeInfo.usedBy.length >= codeInfo.maxUsers) {
    await safeSend(from, { text: '❌ الكود ده وصل للحد الأقصى للاستخدام!' });
    return;
  }

  // Accept the code - save to app DB
  if (!codeInfo.usedBy) codeInfo.usedBy = [];
  codeInfo.usedBy.push(phone);
  await saveCodeToApp(code, phone);

  const msg = CODE_ACCEPTED.replace('{CODE}', code).replace('{DAYS}', codeInfo.days);
  await safeSend(from, { text: msg });
  log('Builtin code accepted: ' + code + ' (' + codeInfo.type + ') for phone: ' + phone);
}

// ====== Receipt Handler ======
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

  log('AI fields: type=' + aiType + ' keyword=' + aiKeyword + ' number=' + aiNumber + ' amount=' + aiAmount + ' date=' + aiDate + ' time=' + aiTime + ' method=' + aiMethod + ' edited=' + aiEdited + ' result=' + aiResult);

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

  // Check if edited
  const isEdited = aiEdited.includes('نعم') || aiEdited.includes('Yes') || aiEdited.includes('معدل');

  const allOk = isPaymentReceipt && hasPaymentKeyword && numberOk && amountOk && dateOk && timeOk && !isEdited && aiResult === 'مقبول';

  // Build specific rejection reason
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
      type: aiType,
      keyword: aiKeyword,
      number: aiNumber,
      amount: aiAmount,
      date: aiDate,
      time: aiTime,
      method: aiMethod,
      edited: aiEdited,
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

    // Check for duplicate receipt
    if (checkReceiptHash(buf)) {
      userStates[phone] = 'awaiting_receipt';
      await safeSend(from, {
        text: RECEIPT_REJECTED.replace('{REASON}', 'الإيصال ده تم استخدامه قبل كده! كل إيصال بيتستخدم مرة واحدة بس')
      });
      return;
    }

    try {
      // Check if Gemini is available
      if (!geminiModel) {
        log('Gemini not initialized, cannot verify receipt');
        userStates[phone] = 'awaiting_receipt';
        await safeSend(from, {
          text: RECEIPT_REJECTED.replace('{REASON}', 'خدمة التحقق مش متاحة حالياً، حاول تاني بعد شوية')
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
        // Generate activation code
        const code = generateActivationCode(phone);
        // Save code to app database (so user can activate in app)
        const savedToApp = await saveCodeToApp(code, phone);
        userStates[phone] = 'idle';
        await safeSend(from, { text: RECEIPT_ACCEPTED.replace('{CODE}', code) });
        log('Receipt ACCEPTED for ' + phone + ', code: ' + code + ', savedToApp: ' + savedToApp);
        return;
      }

      // Rejected - give specific reason
      userStates[phone] = 'awaiting_receipt';
      await safeSend(from, { text: RECEIPT_REJECTED.replace('{REASON}', result.reason) });
      log('Receipt REJECTED for ' + phone + ': ' + result.reason);

    } catch (aiErr) {
      log('AI verify failed: ' + aiErr.message);
      userStates[phone] = 'awaiting_receipt';

      let reason = 'خدمة التحقق مش متاحة حالياً، حاول تاني بعد شوية';
      if (aiErr.message.includes('timeout')) reason = 'السيرفر بطيء حالياً، حاول تبعت الصورة تاني';
      else if (aiErr.message.includes('API key')) reason = 'مفيش اتصال بخدمة التحقق، حاول تاني بعد شوية';
      else if (aiErr.message.includes('quota')) reason = 'خدمة التحقق وصلت للحد المسموح، حاول تاني بعد ساعة';
      else if (aiErr.message.includes('429')) reason = 'خدمة التحقق وصلت للحد المسموح، حاول تاني بعد دقيقة';

      await safeSend(from, { text: RECEIPT_REJECTED.replace('{REASON}', reason) });
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
log('OptiSize Bot v4.7 starting...');
log('Node: ' + process.version + ' PID: ' + process.pid);
log('GEMINI_API_KEY: ' + (GEMINI_API_KEY ? 'SET (' + GEMINI_API_KEY.substring(0, 8) + '...)' : 'NOT SET'));

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

loadLidMappings();
